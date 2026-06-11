// @server-import server.ts

import TemplateEngine from '../../modules/template-engine/src/template-engine.js'

const data = TemplateEngine.reactive({
    name: 'my friend'
}, document.getElementById('app-template-use'))