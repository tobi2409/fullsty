// @server-import server.ts

import TemplateEngine from 'mvvm-monster/template-engine.js'
import { setAlign } from 'layout/layout.js'

const data = TemplateEngine.reactive(
    {
        name: 'my friend',
        serverMessage: 'Server not responded yet',
        todos: [{ text: 'Sample todo', done: false }, { text: 'Another todo', done: true }]
    },
    document.getElementById('app-template-use')
)

for (const todoDiv of document.querySelectorAll('.todo')) {
    setAlign(todoDiv, 'right')
}

data.serverMessage = await Server.helloFromServer('my friend')