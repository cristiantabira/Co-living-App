const { Expense, ExpenseDebt } = require("../models/Expense");
const User = require("../models/User");
const Apartment = require("../models/Apartment");
const Complex = require("../models/Complex");
const { Op } = require("sequelize");
const { notifyAllDebtors, sendPaymentReminder } = require("../services/emailService");

const createExpense = async (req, res) => {
    try {
        const { description, totalAmount, category, debtors } = req.body;
        // debtors ar trebui să fie un array de obiecte: [{ userId: 1, amountOwed: 50 }, { userId: 2, amountOwed: 50 }]

        // Obținem informații despre utilizatorul curent (Payer)
        const payer = await User.findByPk(req.user.id);

        // 1. Creăm cheltuiala (payerId vine din middleware-ul protect)
        const expense = await Expense.create({
            description,
            totalAmount,
            category,
            payerId: req.user.id,
            scopeType: "PERSONAL",
            isAdminBilled: false,
        });

        // 2. Distribuim datoriile către ceilalți colegi
        if (debtors && debtors.length > 0) {
            const debtEntries = debtors.map((debt) => ({
                expenseId: expense.id,
                userId: debt.userId,
                amountOwed: debt.amountOwed,
                isSettled: false,
            }));

            await ExpenseDebt.bulkCreate(debtEntries);

            // 3. Trimitem notificări prin email tuturor debtorilor
            const debtorUsers = await User.findAll({
                where: { id: debtors.map(d => d.userId) }
            });

            // Trimitem emailuri asincron (nu blocăm răspunsul)
            notifyAllDebtors(
                debtorUsers,
                payer.name,
                description,
                totalAmount,
                'PERSONAL'
            ).catch(err => console.error('Eroare la trimitere email-uri:', err));
        }

        res.status(201).json({
            message: "Cheltuială adăugată și împărțită cu succes!",
            expense,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Noua funcție pentru facturile admin per complex sau apartament
const createAdminBill = async (req, res) => {
    try {
        const { scopeType, scopeId, description, totalAmount, distributionData } = req.body;
        const adminId = req.user.id;

        // Validare
        if (!["COMPLEX", "APARTMENT"].includes(scopeType)) {
            return res.status(400).json({ message: "scopeType trebuie să fie COMPLEX sau APARTMENT" });
        }

        let debtors = [];
        let debtorUsers = [];

        if (scopeType === "COMPLEX") {
            // Găsim apartamentele cu > 0 locuitori
            const apartments = await Apartment.findAll({ 
                where: { complexId: scopeId },
                include: [
                    {
                        model: User,
                        attributes: ["id", "name", "email"],
                        required: false
                    }
                ]
            });

            // Filtrăm doar apartamentele cu locatari
            const apartmentsWithResidents = apartments.filter(a => a.Users && a.Users.length > 0);

            if (apartmentsWithResidents.length === 0) {
                return res.status(400).json({ message: "Nu au fost găsite apartamente cu locatari în acest complex" });
            }

            // Distribuim suma între apartamentele cu locatari, apoi între locatarii lor
            const amountPerApartment = parseFloat(totalAmount) / apartmentsWithResidents.length;

            apartmentsWithResidents.forEach(apt => {
                const amountPerResident = (amountPerApartment / apt.Users.length).toFixed(2);
                apt.Users.forEach(user => {
                    debtors.push({
                        userId: user.id,
                        amountOwed: amountPerResident
                    });
                    debtorUsers.push(user);
                });
            });
        } else if (scopeType === "APARTMENT") {
            // Găsim locatarii din apartament
            const residents = await User.findAll({
                where: { apartmentId: scopeId },
                attributes: ["id", "name", "email"]
            });

            if (residents.length === 0) {
                return res.status(400).json({ message: "Nu au fost găsiți locatari pentru acest apartament" });
            }

            const amountPerResident = (parseFloat(totalAmount) / residents.length).toFixed(2);
            residents.forEach(user => {
                debtors.push({
                    userId: user.id,
                    amountOwed: amountPerResident
                });
                debtorUsers.push(user);
            });
        }

        if (debtors.length === 0) {
            return res.status(400).json({ message: "Nu au fost găsiți locatari pentru această factură" });
        }

        // Creăm cheltuiala
        const expenseData = {
            description,
            totalAmount,
            category: scopeType === "COMPLEX" ? "Utilități Complex" : "Utilități Apartament",
            payerId: adminId,
            scopeType,
            scopeId,
            isAdminBilled: true,
        };

        // Dacă e factură pe apartament, setez și apartmentId
        if (scopeType === "APARTMENT") {
            expenseData.apartmentId = scopeId;
        }

        const expense = await Expense.create(expenseData);

        // Distribuim datoriile
        const debtEntries = debtors.map((debtor) => ({
            expenseId: expense.id,
            userId: debtor.userId,
            amountOwed: parseFloat(debtor.amountOwed).toFixed(2),
            isSettled: false,
        }));

        await ExpenseDebt.bulkCreate(debtEntries);

        // Trimitem notificări prin email tuturor debtorilor (asincron)
        const admin = await User.findByPk(adminId);
        notifyAllDebtors(
            debtorUsers,
            admin.name,
            description,
            totalAmount,
            'ADMIN'
        ).catch(err => console.error('Eroare la trimitere email-uri:', err));

        res.status(201).json({
            message: `Factură administrativă creată și distribuită la ${debtors.length} locatari!`,
            expense,
            debtorsCount: debtors.length,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMyExpenses = async (req, res) => {
    try {
        // Luăm cheltuielile unde user-ul este fie cel care a plătit, fie cel care datorează
        const user = await User.findByPk(req.user.id, {
            include: [
                { model: Expense, as: "PaidExpenses" },
                { model: Expense, through: ExpenseDebt, as: "Expenses" }, // Cheltuielile unde e debitor
            ],
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getBalance = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Cât am plătit eu pentru alții
        // Adăugăm model: Expense pentru ca Sequelize să știe asocierile
        const toReceiveResult = await ExpenseDebt.sum("amountOwed", {
            where: { isSettled: false },
            include: [
                {
                    model: Expense,
                    where: { payerId: userId },
                },
            ],
        });

        // 2. Cât datorez eu altora
        const toPayResult = await ExpenseDebt.sum("amountOwed", {
            where: { userId: userId, isSettled: false },
        });

        // Convertim null în 0 pentru a nu crăpa frontend-ul
        const toReceive = toReceiveResult || 0;
        const toPay = toPayResult || 0;

        res.json({
            toReceive,
            toPay,
            balance: toReceive - toPay,
        });
    } catch (error) {
        console.error("Eroare la getBalance:", error);
        res.status(500).json({ error: error.message });
    }
};

const getExpenseHistory = async (req, res) => {
     try {
         const userId = req.user.id;

         const expenses = await Expense.findAll({
             include: [
                 {
                     model: User,
                     as: "Payer",
                     attributes: ["id", "name"],
                 },
                 {
                     model: User,
                     as: "Debtors",
                     attributes: ["id", "name"],
                     through: { attributes: ["amountOwed", "isSettled"] },
                 },
                 {
                     model: Complex,
                     as: "Complex",
                     attributes: ["id", "name"],
                     required: false,
                 },
             ],
             order: [["createdAt", "DESC"]], // Cele mai noi primele
         });

         // Filtrăm ca utilizatorul să vadă doar cheltuielile care îl privesc
         const myHistory = expenses.filter((exp) => {
             const isPayer = exp.payerId === userId;
             const isDebtor = exp.Debtors.some((d) => d.id === userId);
             return isPayer || isDebtor;
         });

         res.json(myHistory);
     } catch (error) {
         res.status(500).json({ error: error.message });
     }
 };

const settleDebt = async (req, res) => {
    try {
        const { debtId } = req.params;
        const debt = await ExpenseDebt.findByPk(debtId);

        if (!debt)
            return res
                .status(404)
                .json({ message: "Datoria nu a fost găsită" });

        debt.isSettled = true;
        await debt.save();

        res.json({ message: "Datorie achitată cu succes!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Endpoint pentru a obține datorii detaliate: cât datorez fiecărei persoane și cât îmi datorează
const getDebtsDetails = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. DATORII: Cât datorez eu altora
        const myDebts = await ExpenseDebt.findAll({
            where: { userId: userId, isSettled: false },
            include: [
                {
                    model: Expense,
                    attributes: ["id", "description", "createdAt"],
                    include: [
                        {
                            model: User,
                            as: "Payer",
                            attributes: ["id", "name"],
                        },
                    ],
                },
            ],
        });

        // 2. CREDITE: Cât îmi datorează alții (cheltuielile pe care le-am plătit eu)
        const expenses = await Expense.findAll({
            where: { payerId: userId },
            include: [
                {
                    model: User,
                    as: "Debtors",
                    attributes: ["id", "name"],
                    through: { attributes: ["amountOwed", "isSettled"] },
                },
            ],
        });

        // Agregare DATORII per persoană
        const debtsByPerson = {};
        myDebts.forEach((debt) => {
            const payerId = debt.Expense.Payer.id;
            const payerName = debt.Expense.Payer.name;
            const key = `${payerId}`;

            if (!debtsByPerson[key]) {
                debtsByPerson[key] = {
                    personId: payerId,
                    personName: payerName,
                    totalAmount: 0,
                    debts: [],
                };
            }
            debtsByPerson[key].totalAmount += parseFloat(debt.amountOwed);
            debtsByPerson[key].debts.push({
                debtId: debt.id,
                expenseId: debt.Expense.id,
                description: debt.Expense.description,
                amount: debt.amountOwed,
                createdAt: debt.Expense.createdAt,
            });
        });

        // Agregare CREDITE per persoană (cine îmi datorează)
        const creditsByPerson = {};
        expenses.forEach((expense) => {
            expense.Debtors.forEach((debtor) => {
                if (!debtor.ExpenseDebt.isSettled) {
                    const key = `${debtor.id}`;
                    if (!creditsByPerson[key]) {
                        creditsByPerson[key] = {
                            personId: debtor.id,
                            personName: debtor.name,
                            totalAmount: 0,
                            credits: [],
                        };
                    }
                    creditsByPerson[key].totalAmount += parseFloat(debtor.ExpenseDebt.amountOwed);
                    creditsByPerson[key].credits.push({
                        debtId: debtor.ExpenseDebt.id,
                        expenseId: expense.id,
                        description: expense.description,
                        amount: debtor.ExpenseDebt.amountOwed,
                        createdAt: expense.createdAt,
                    });
                }
            });
        });

        res.json({
            debtsTo: Object.values(debtsByPerson).map((d) => ({
                personId: d.personId,
                personName: d.personName,
                totalAmount: parseFloat(d.totalAmount.toFixed(2)),
                details: d.debts,
            })),
            creditsFrom: Object.values(creditsByPerson).map((c) => ({
                personId: c.personId,
                personName: c.personName,
                totalAmount: parseFloat(c.totalAmount.toFixed(2)),
                details: c.credits,
            })),
        });
    } catch (error) {
        console.error("Eroare la getDebtsDetails:", error);
        res.status(500).json({ error: error.message });
    }
};

// Endpoint pentru a obține cheltuieli separate: administrativă vs personale
const getExpensesByType = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type } = req.query; // "ADMIN" sau "PERSONAL"

        // Obținem toate cheltuielile unde utilizatorul e implicat
        const expenses = await Expense.findAll({
            include: [
                {
                    model: User,
                    as: "Payer",
                    attributes: ["id", "name"],
                },
                {
                    model: User,
                    as: "Debtors",
                    attributes: ["id", "name"],
                    through: { attributes: ["amountOwed", "isSettled"] },
                },
                {
                    model: Complex,
                    as: "Complex",
                    attributes: ["id", "name"],
                    required: false,
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        // Filtrare: care cheltuieli îl privesc pe user și potrivit tipului
        let filtered = expenses.filter((exp) => {
            const isPayer = exp.payerId === userId;
            const isDebtor = exp.Debtors.some((d) => d.id === userId);
            return isPayer || isDebtor;
        });

        // Dacă e specificat tipul, filtrez doar administrativă sau personale
        if (type === "ADMIN") {
            filtered = filtered.filter((exp) => exp.isAdminBilled === true);
        } else if (type === "PERSONAL") {
            filtered = filtered.filter((exp) => exp.isAdminBilled === false);
        }

        res.json(filtered);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Endpoint pentru a trimite reminder de plată unui debtor (De platit)
const sendPaymentReminderEndpoint = async (req, res) => {
    try {
        const { debtId } = req.body;
        const creditorId = req.user.id;

        // Obținem informații despre datorie și debtor
        const debt = await ExpenseDebt.findByPk(debtId, {
            include: [
                {
                    model: Expense,
                    attributes: ["id", "description", "totalAmount"],
                    include: [
                        {
                            model: User,
                            as: "Payer",
                            attributes: ["id", "name", "email"],
                        }
                    ]
                },
                {
                    model: User,
                    attributes: ["id", "name", "email"]
                }
            ]
        });

        if (!debt) {
            return res.status(404).json({ message: "Datoria nu a fost găsită" });
        }

        // Verificare: doar debitorul primește reminder (utilizatorul curent trebuie să fie cel care datorează)
        if (debt.userId !== creditorId) {
            return res.status(403).json({ message: "Nu poți primi reminder pentru o datorie care nu ți-o datorezi" });
        }

        // Trimitem reminder
        const debtor = debt.User;
        const creditor = debt.Expense.Payer;
        const expense = debt.Expense;

        await sendPaymentReminder(
            debtor.email,
            debtor.name,
            creditor.name,
            debt.amountOwed.toFixed(2),
            expense.description
        );

        res.json({
            message: `Reminder trimis cu succes lui ${debtor.name}!`,
            debtId: debt.id,
        });
    } catch (error) {
        console.error("Eroare la trimitere reminder:", error);
        res.status(500).json({ error: error.message });
    }
};

// Endpoint pentru a trimite reminder de recuperare unui debitor (De recuperat)
const sendPaymentReminderForCredit = async (req, res) => {
    try {
        const { debtId } = req.body;
        const payerId = req.user.id;

        // Obținem informații despre datorie
        const debt = await ExpenseDebt.findByPk(debtId, {
            include: [
                {
                    model: Expense,
                    attributes: ["id", "description", "totalAmount"],
                    include: [
                        {
                            model: User,
                            as: "Payer",
                            attributes: ["id", "name", "email"],
                        }
                    ]
                },
                {
                    model: User,
                    attributes: ["id", "name", "email"]
                }
            ]
        });

        if (!debt) {
            return res.status(404).json({ message: "Datoria nu a fost găsită" });
        }

        // Verificare: doar cel care a plătit inițial poate trimite reminder
        if (debt.Expense.payerId !== payerId) {
            return res.status(403).json({ message: "Nu poți trimite reminder pentru o datorie care nu ți-o datorează" });
        }

        // Trimitem reminder către cel care datorează
        const debtor = debt.User;
        const creditor = debt.Expense.Payer;
        const expense = debt.Expense;

        await sendPaymentReminder(
            debtor.email,
            debtor.name,
            creditor.name,
            debt.amountOwed.toFixed(2),
            expense.description
        );

        res.json({
            message: `Reminder trimis cu succes lui ${debtor.name}!`,
            debtId: debt.id,
        });
    } catch (error) {
        console.error("Eroare la trimitere reminder pentru credit:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createExpense,
    createAdminBill,
    getMyExpenses,
    getBalance,
    getExpenseHistory,
    settleDebt,
    getDebtsDetails,
    getExpensesByType,
    sendPaymentReminderEndpoint,
    sendPaymentReminderForCredit,
};
