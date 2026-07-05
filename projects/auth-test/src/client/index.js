// @server-import server.ts

import TemplateEngine from 'template-engine/template-engine.js'

const data = TemplateEngine.reactive({
    login: {
        email: 'user@dummy.com',
        password: 'dummy',
        okClick: async () => {
            try {
                const token = await Server.loginUser(data.login.email, data.login.password)
                alert(`Login successful. Token: ${token}`)
            } catch (error) {
                alert(error)
            }
        }
    },
    register: {
        email: 'user@dummy.com',
        password: 'dummy',
        okClick: async () => {
            try {
                const fetchedUser = await Server.registerUser(data.register.email, data.register.password)
                alert(`New user registered with UUID: ${fetchedUser.uuid}`)
            } catch (error) {
                alert(error)
            }
        }
    },
    currentUser: {
        token: 'abc-0123-xyz',
        okClick: async () => {
            try {
                const uuid = await Server.getCurrentUser(data.currentUser.token)
                alert(`Current user UUID: ${uuid}`)
            } catch (error) {
                alert(error)
            }
        }
    }
}, document.getElementById('app-template-use'))