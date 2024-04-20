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

        // Zapytanie SQL do pobrania ilości stworzonych szablonów w ciągu ostatnich 10 dni
        const query = `
            SELECT DATE(timestamp) AS date, COUNT(*) AS count
            FROM created
            GROUP BY DATE(timestamp)
            ORDER BY DATE(timestamp) asc`;

        // Wykonanie zapytania
        database.query(query, async function (error, results) {
            if (error) {
                console.error('Błąd zapytania SQL:', error);
                interaction.reply({ content: 'Wystąpił błąd podczas pobierania danych z bazy danych.', ephemeral: true });
                return;
            }

            // Zamknięcie połączenia z bazą danych
            database.end();

            // Przygotowanie danych do wykresu
            const labels = results.map((result, index) => {
                const daysAgo = results.length - index; // Calculate how many days ago
                if (daysAgo === 1) {
                    return 'Dzisiaj';
                } else {
                    return `${daysAgo} dni temu`;
                }
            });
            const data = results.map(result => result.count);
            console.log(data)
            // Utworzenie serwisu renderowania dla canvas z odpowiednimi opcjami
            const canvasRenderService = new ChartJSNodeCanvas({ width: 600, height: 400 });

            // Utworzenie konfiguracji wykresu krzywej Beziera
            const configuration = {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Ilość stworzonych szablonów',
                        data: data,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
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
