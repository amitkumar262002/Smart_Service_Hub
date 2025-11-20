import React, { useMemo, useRef, useState } from 'react'

interface Msg { id: string; role: 'user'|'assistant'; text: string }

const greetings = [
  'Hey there! I\'m here to help ✨',
  'Hi! How can I support you today? 😊',
  'Hello! Need a service recommendation? 💡'
]

function empathize(input: string){
  const s = input.toLowerCase()
  if (/(angry|bad|upset|worst|frustrat)/.test(s)) return "I'm really sorry you're going through this. I\'ll do my best to fix it right away. 💛"
  if (/(late|delay|waiting|slow)/.test(s)) return 'Thanks for your patience—let me speed this up for you. ⏱️'
  if (/(love|great|awesome|thanks|thank)/.test(s)) return 'That makes my day! Thank you for the love. 🌟'
  if (/(price|cost|budget|cheap)/.test(s)) return 'I can suggest budget-friendly options and deals for you. 💰'
  return 'I understand. Here\'s what I can do for you. 🤝'
}

function suggest(input: string){
  const s = input.toLowerCase()
  if (/(clean|house|maid|deep)/.test(s)) return 'Popular now: Deep Home Cleaning, Kitchen Degrease, Sofa Shampoo.'
  if (/(plumb|leak|tap|bath|toilet)/.test(s)) return 'Try: Tap Repair, Leak Fix, Water Tank Cleaning.'
  if (/(electri|fan|light|ac|appliance)/.test(s)) return 'Options: Fan Install, Light Fixture, Appliance Repair.'
  if (/(pest|cockroach|termite|rat)/.test(s)) return 'Top picks: Cockroach Control, Termite Treatment, Rodent Control.'
  return 'Tell me a category like Cleaning, Plumber, Electrician, or Appliance Repair.'
}

export default function Chatbot(){
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const listRef = useRef<HTMLDivElement|null>(null)

  const hello = useMemo(()=>greetings[Math.floor(Math.random()*greetings.length)],[])

  const send = () => {
    const text = input.trim()
    if(!text) return
    const id = Math.random().toString(36).slice(2)
    const userMsg: Msg = { id, role:'user', text }
    const empathy = empathize(text)
    const rec = suggest(text)
    const botMsg: Msg = { id: id+'a', role:'assistant', text: `${empathy}\n\n${rec}` }
    setMsgs(m => [...m, userMsg, botMsg])
    setInput('')
    setTimeout(()=>listRef.current?.scrollTo({top: 99999, behavior:'smooth'}), 10)
  }

  return (
    <div className={open ? 'chatbot open' : 'chatbot'}>
      <button className="chat-fab" onClick={()=>setOpen(v=>!v)} aria-label="Chat with us">💬</button>
      <div className="chat-panel" role="dialog" aria-label="Smart ServiceHub Assistant">
        <div className="chat-header">Smart Assistant <span className="muted">(Emotional AI)</span></div>
        <div className="chat-list" ref={listRef}>
          <div className="msg assistant">{hello}</div>
          {msgs.map(m => (
            <div key={m.id} className={m.role === 'assistant' ? 'msg assistant' : 'msg user'}>{m.text}</div>
          ))}
        </div>
        <div className="chat-input">
          <input
            className="input"
            placeholder="Ask anything… e.g. plumber for leak, budget options"
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter') send() }}
          />
          <button className="btn" onClick={send}>Send</button>
        </div>
      </div>
    </div>
  )
}
