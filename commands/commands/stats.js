const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Pobiera ilość stworzonych szablonów w ciągu ostatnich dni'),
    async execute(interaction) {
        const dbconfig = {
            host: 'localhost',
            user: 'root',
            password: '',
            database: '37533466_templates',
            charset: 'utf8mb4',
            collation: 'utf8mb4_unicode_ci'
        };

        // Funkcja inicjująca połączenie z bazą danych
        function initializeDatabaseConnection() {
            return mysql.createConnection(dbconfig);
        }

        // Inicjalizacja połączenia z bazą danych
        const database = initializeDatabaseConnection();

        // Zapytanie SQL do pobrania ilości stworzonych szablonów w ciągu ostatnich 7 dni
        const query = `
            SELECT DATE(timestamp) AS date, COUNT(*) AS count
            FROM created
            WHERE DATE(timestamp) >= DATE_SUB(CURDATE(), INTERVAL 8 DAY)
            GROUP BY DATE(timestamp)
            ORDER BY DATE(timestamp) ASC`;

        // Wykonanie zapytania
        database.query(query, async function (error, results) {
            console.log(results)
            if (error) {
                console.error('Błąd zapytania SQL:', error);
                interaction.reply({ content: 'Wystąpił błąd podczas pobierania danych z bazy danych.', ephemeral: true });
                return;
            }

            // Zamknięcie połączenia z bazą danych
            database.end();

            // Przygotowanie danych do wykresu
            const labels = [];
            const data = [];
            for (let i = 0; i < 8; i++) {
                const currentDate = new Date();
                currentDate.setDate(currentDate.getDate() - i - 1); // Odjęcie dodatkowego dnia dla "wczoraj"
                const formattedDate = currentDate.toISOString().split('T')[0]; // Formatowanie daty na rok-miesiąc-dzień

                const foundResult = results.find(result => result.date.toISOString().split('T')[0] === formattedDate);

                if (i === 0) {
                    labels.unshift('Dzisiaj');
                } else if (i === 1) {
                    labels.unshift('Wczoraj');
                } else {
                    labels.unshift(`${i} dni temu`);
                }

                data.unshift(foundResult ? foundResult.count : 0);
            }

            // Utworzenie serwisu renderowania dla canvas z odpowiednimi opcjami
            const canvasRenderService = new ChartJSNodeCanvas({ width: 600, height: 400 });

            // Utworzenie konfiguracji wykresu krzywej Beziera
            // Utworzenie konfiguracji wykresu krzywej Beziera
            const configuration = {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Ilość stworzonych szablonów',
                        data: data,
                        borderColor: 'rgba(153, 102, 255, 1)', // Fioletowy kolor linii
                        backgroundColor: 'rgba(153, 102, 255, 0.2)', // Kolor wypełnienia
                        tension: 0.4 // Ustawienie napięcia krzywej
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            };


            try {
                // Renderowanie wykresu do bufora
                const buffer = await canvasRenderService.renderToBuffer(configuration);

                // Wysłanie wykresu jako wiadomość na Discordzie
                interaction.reply({ files: [buffer] });
            } catch (renderError) {
                console.error('Błąd podczas renderowania wykresu:', renderError);
                interaction.reply({ content: 'Wystąpił błąd podczas generowania wykresu.', ephemeral: true });
            }
        });
    },
};
