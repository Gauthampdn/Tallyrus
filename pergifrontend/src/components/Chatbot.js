import React, { useEffect, useRef } from 'react'
import './chatbot.css'

const Chatbot = () => {
    const chatFormRef = useRef(null)

    useEffect(() => {
        // Select elements
        const chatBody = document.querySelector('.chat-body')
        const messageInput = document.querySelector('.message-input')
        const sendMessageBtn = document.querySelector('#send-message')
        const fileInput = document.querySelector('#file-input')
        const fileUploadWrapper = document.querySelector('.file-upload-wrapper')
        const fileCancelButton = document.querySelector('#file-cancel')
        const chatbotToggler = document.querySelector('#chatbot-toggler')
        const closeChatbotBtn = document.querySelector('#close-chatbot')

        const API_URL = `${process.env.REACT_APP_API_BACKEND}/openai/function-call`

        // User data and history
        let userData = { message: null, file: { data: null, mime_type: null } }
        const chatHistory = []
        const initialInputHeight = messageInput.scrollHeight

        const createMessageElement = (content, ...classes) => {
            const div = document.createElement('div')
            div.classList.add('message', ...classes)
            div.innerHTML = content
            return div
        }

        const generateBotResponse = async (incomingDiv) => {
            const messageElem = incomingDiv.querySelector('.message-text')
            chatHistory.push({
                role: 'user',
                parts: [
                    { text: userData.message },
                    ...(userData.file.data
                        ? [{ inline_data: userData.file }]
                        : []),
                ],
            })
            try {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    mode: 'cors',
                    body: JSON.stringify({ userInput: userData.message }),
                })
                const data = await res.json()

                if (!res.ok) {
                    throw new Error(data.error || 'Server error')
                }

                // **NEW**: turn your JSON into a user-friendly string
                let replyText = data.message || ''

                if (data.result && data.result.title && data.result.joincode) {
                    replyText = `✅ Class "${data.result.title}" created!\nJoin Code: ${data.result.joincode}`
                }

                messageElem.innerText = replyText
                //chatHistory.push({ role: 'model', parts: [{ text }] });
            } catch (err) {
                messageElem.innerText = err.message
                messageElem.style.color = '#ff0000'
            } finally {
                userData.file = {}
                incomingDiv.classList.remove('thinking')
                chatBody.scrollTo({
                    top: chatBody.scrollHeight,
                    behavior: 'smooth',
                })
            }
        }

        const handleOutgoing = (e) => {
            e.preventDefault()
            userData.message = messageInput.value.trim()
            messageInput.value = ''
            messageInput.dispatchEvent(new Event('input'))
            fileUploadWrapper.classList.remove('file-uploaded')

            const msgContent = `<div class=\"message-text\"></div>${
                userData.file.data
                    ? `<img src=\"data:${userData.file.mime_type};base64,${userData.file.data}\" class=\"attachment\" />`
                    : ''
            }`
            const outDiv = createMessageElement(msgContent, 'user-message')
            outDiv.querySelector('.message-text').innerText = userData.message
            chatBody.appendChild(outDiv)
            chatBody.scrollTo({
                top: chatBody.scrollHeight,
                behavior: 'smooth',
            })

            setTimeout(() => {
                const botContent = `<img src=\"/tallyrus2white.png\" alt=\"Tallybot Logo\" class=\"bot-avatar\" width=\"50\" height=\"50\"></img>
          <div class=\"message-text\"> <div class=\"thinking-indicator\"><div class=\"dot\"></div><div class=\"dot\"></div><div class=\"dot\"></div></div></div>`
                const inDiv = createMessageElement(
                    botContent,
                    'bot-message',
                    'thinking'
                )
                chatBody.appendChild(inDiv)
                chatBody.scrollTo({
                    top: chatBody.scrollHeight,
                    behavior: 'smooth',
                })
                generateBotResponse(inDiv)
            }, 600)
        }

        // Dynamic height
        messageInput.addEventListener('input', () => {
            messageInput.style.height = `${initialInputHeight}px`
            messageInput.style.height = `${messageInput.scrollHeight}px`
            document.querySelector('.chat-form').style.borderRadius =
                messageInput.scrollHeight > initialInputHeight ? '15px' : '32px'
        })

        // Enter key send
        messageInput.addEventListener('keydown', (e) => {
            if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                e.target.value.trim() &&
                window.innerWidth > 768
            ) {
                handleOutgoing(e)
            }
        })

        // File upload
        fileInput.addEventListener('change', () => {
            const file = fileInput.files[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = (ev) => {
                fileInput.value = ''
                fileUploadWrapper.querySelector('img').src = ev.target.result
                fileUploadWrapper.classList.add('file-uploaded')
                const base64 = ev.target.result.split(',')[1]
                userData.file = { data: base64, mime_type: file.type }
            }
            reader.readAsDataURL(file)
        })
        fileCancelButton.addEventListener('click', () => {
            userData.file = {}
            fileUploadWrapper.classList.remove('file-uploaded')
        })

        // Buttons
        sendMessageBtn.addEventListener('click', handleOutgoing)
        document
            .querySelector('#file-upload')
            .addEventListener('click', () => fileInput.click())
        closeChatbotBtn.addEventListener('click', () =>
            document.body.classList.remove('show-chatbot')
        )
        chatbotToggler.addEventListener('click', () =>
            document.body.classList.toggle('show-chatbot')
        )

        // Cleanup
        return () => {
            // remove listeners if needed
        }
    }, [])

    return (
        <>
            <button id="chatbot-toggler">
                <span className="material-symbols-rounded">mode_comment</span>
                <span className="material-symbols-rounded">close</span>
            </button>

            <div className="chatbot-popup">
                <div className="chat-header">
                    <div className="header-info">
                        <img
                            src="/tallyrus2.png"
                            alt="Tallybot Logo"
                            className="chatbot-logo"
                            width="50"
                            height="50"
                        >
                            {/* SVG PATH HERE */}
                        </img>
                        <h2 className="logo-text">Tallybot</h2>
                    </div>
                    <button
                        id="close-chatbot"
                        className="material-symbols-rounded"
                    >
                        keyboard_arrow_down
                    </button>
                </div>

                <div className="chat-body">
                    <div className="message bot-message">
                        <img
                            src="/tallyrus2white.png"
                            alt="Tallybot Logo"
                            className="bot-avatar"
                            fill="#fff"
                            width="50"
                            height="50"
                        ></img>
                        <div className="message-text">
                            Hello there!
                            <br />
                            How can I help you today?
                        </div>
                    </div>
                </div>

                <div className="chat-footer">
                    <form ref={chatFormRef} className="chat-form">
                        <textarea
                            placeholder="Message..."
                            className="message-input"
                            required
                        />
                        <div className="chat-controls">
                            <div className="file-upload-wrapper">
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="file-input"
                                    hidden
                                />
                                <img src="#" alt="attachment preview" />
                                <button
                                    type="button"
                                    id="file-upload"
                                    className="material-symbols-rounded"
                                >
                                    attach_file
                                </button>
                                <button
                                    type="button"
                                    id="file-cancel"
                                    className="material-symbols-rounded"
                                >
                                    close
                                </button>
                            </div>
                            <button
                                type="submit"
                                id="send-message"
                                className="material-symbols-rounded"
                            >
                                arrow_upward
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Chatbot
