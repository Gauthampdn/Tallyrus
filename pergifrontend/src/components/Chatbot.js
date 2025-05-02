import React, { useEffect, useRef, useState } from 'react'
import './chatbot.css'

const Chatbot = ({ onApiSubmit }) => {
    const chatFormRef = useRef(null)
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            content: 'Hello there!\nHow can I help you today?',
        },
    ])
    const [isLoading, setIsLoading] = useState(false)

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

        // User data
        let userData = { message: null, file: { data: null, mime_type: null } }
        const initialInputHeight = messageInput.scrollHeight

        const createMessageElement = (content, ...classes) => {
            const div = document.createElement('div')
            div.classList.add('message', ...classes)
            div.innerHTML = content
            return div
        }

        const handleOutgoing = async (e) => {
            e.preventDefault()
            const message = messageInput.value.trim()
            if (!message) return

            // Clear input and reset file upload
            messageInput.value = ''
            messageInput.dispatchEvent(new Event('input'))
            fileUploadWrapper.classList.remove('file-uploaded')

            // Add user message to state
            setMessages((prev) => [...prev, { type: 'user', content: message }])

            // Add bot thinking message
            setMessages((prev) => [
                ...prev,
                { type: 'bot', content: '...', isLoading: true },
            ])
            setIsLoading(true)

            try {
                // Call the onApiSubmit function from Home.js
                const response = await onApiSubmit({
                    preventDefault: () => {},
                    target: { value: message },
                })

                // Update the last bot message with the response
                setMessages((prev) => {
                    const newMessages = [...prev]
                    newMessages[newMessages.length - 1] = {
                        type: 'bot',
                        content:
                            response.message ||
                            'Successfully processed your request!',
                    }
                    return newMessages
                })
            } catch (error) {
                // Update the last bot message with error
                setMessages((prev) => {
                    const newMessages = [...prev]
                    newMessages[newMessages.length - 1] = {
                        type: 'bot',
                        content: error.message || 'An error occurred',
                    }
                    return newMessages
                })
            } finally {
                setIsLoading(false)
                userData.file = {}
            }
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
    }, [onApiSubmit]) // Add onApiSubmit to dependency array

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
                        />
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
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`message ${message.type}-message ${
                                message.isLoading ? 'thinking' : ''
                            }`}
                        >
                            {message.type === 'bot' && (
                                <img
                                    src="/tallyrus2white.png"
                                    alt="Tallybot Logo"
                                    className="bot-avatar"
                                    width="50"
                                    height="50"
                                />
                            )}
                            <div className="message-text">
                                {message.isLoading ? (
                                    <div className="thinking-indicator">
                                        <div className="dot"></div>
                                        <div className="dot"></div>
                                        <div className="dot"></div>
                                    </div>
                                ) : (
                                    message.content
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="chat-footer">
                    <form ref={chatFormRef} className="chat-form">
                        <textarea
                            placeholder="Message..."
                            className="message-input"
                            required
                            disabled={isLoading}
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
                                    disabled={isLoading}
                                >
                                    attach_file
                                </button>
                                <button
                                    type="button"
                                    id="file-cancel"
                                    className="material-symbols-rounded"
                                    disabled={isLoading}
                                >
                                    close
                                </button>
                            </div>
                            <button
                                type="submit"
                                id="send-message"
                                className="material-symbols-rounded"
                                disabled={isLoading}
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
