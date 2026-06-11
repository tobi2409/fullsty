// @server-import server.ts

import TemplateEngine from '../../modules/template-engine/src/template-engine.js'

const data = TemplateEngine.reactive({
    name: 'my friend',
    dbHealthStatus: 'not checked',
    async loadDbHealth() {
        data.dbHealthStatus = 'loading...'

        try {
            const result = await Server.getDbHealth()
            data.dbHealthStatus = result.ok
                ? `ok (${result.dbTime})`
                : 'not ok'
        } catch (error) {
            data.dbHealthStatus = error instanceof Error
                ? `error: ${error.message}`
                : 'error: unknown'
        }
    }
}, document.getElementById('app-template-use'))