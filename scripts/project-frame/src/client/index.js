// @server-import server.ts

import TemplateEngine from 'template-engine/template-engine.js'

const data = TemplateEngine.reactive({
    name: 'my friend',
    serverMessage: 'Server not responded yet'
}, document.getElementById('app-template-use'))

data.serverMessage = await Server.helloFromServer('my friend')