// @server-import server.ts

import TemplateEngine from 'mvvm-monster/template-engine.js'

const data = TemplateEngine.reactive(
    {
        loginSection: {
            email: 'user@dummy.com',
            password: 'dummy',
            statusMessage: '',
            statusColor: 'black',
            okClick: async () => {
                try {
                    const token = await Server.loginUser(
                        data.loginSection.email,
                        data.loginSection.password
                    )
                    data.loginSection.statusMessage = `Login successful. Token: ${token}`
                    data.loginSection.statusColor = 'green'
                } catch (error) {
                    data.loginSection.statusMessage = `Login failed. Error: ${error}`
                    data.loginSection.statusColor = 'red'
                }
            }
        },
        registerSection: {
            email: 'user@dummy.com',
            password: 'dummy',
            statusMessage: '',
            statusColor: 'black',
            okClick: async () => {
                try {
                    const fetchedUser = await Server.registerUser(
                        data.registerSection.email,
                        data.registerSection.password
                    )
                    data.registerSection.statusMessage = `New user registered with UUID: ${fetchedUser.uuid}`
                    data.registerSection.statusColor = 'green'
                } catch (error) {
                    data.registerSection.statusMessage = `Registration failed. Error: ${error}`
                    data.registerSection.statusColor = 'red'
                }
            }
        },
        currentUserSection: {
            token: 'abc-0123-xyz',
            statusMessage: '',
            statusColor: 'black',
            okClick: async () => {
                try {
                    const uuid = await Server.getCurrentUser(
                        data.currentUserSection.token
                    )
                    data.currentUserSection.statusMessage = `Current user UUID: ${uuid}`
                    data.currentUserSection.statusColor = 'green'
                } catch (error) {
                    data.currentUserSection.statusMessage = `Failed to get current user. Error: ${error}`
                    data.currentUserSection.statusColor = 'red'
                }
            }
        }
    },
    document.getElementById('app-template-use')
)
