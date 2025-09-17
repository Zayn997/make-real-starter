import { TldrawUiIcon, stopEventPropagation } from 'tldraw'
import { ChangeEvent, useCallback, useState, useEffect } from 'react'

const POPULAR_MODELS = [
	// { value: 'qwen3:8b', label: 'Qwen3 8B (Default)' },
	{ value: 'qwen2.5vl:7b', label: 'Qwen2.5vl 7B (Default)' },
	{ value: 'gemma3:27b', label: 'Gemma3 27B' },
	{ value: 'llama3.2-vision', label: 'Llama 3.2 Vision' },
	{ value: 'llama4:16x17b', label: 'Llama 4 16x17B' },
	{ value: 'llava:7b', label: 'Llava 7B' },
	{ value: 'custom', label: 'Custom Model...' },
]

export function ModelSettings() {
	const [isOpen, setIsOpen] = useState(false)
	const [selectedModel, setSelectedModel] = useState('qwen3:8b')
	const [customModel, setCustomModel] = useState('')

	useEffect(() => {
		// Load saved model from localStorage
		const saved = localStorage.getItem('makeitreal_model')
		if (saved) {
			if (POPULAR_MODELS.some((m) => m.value === saved)) {
				setSelectedModel(saved)
			} else {
				setSelectedModel('custom')
				setCustomModel(saved)
			}
		}
	}, [])

	const handleModelChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value
		setSelectedModel(value)

		if (value !== 'custom') {
			localStorage.setItem('makeitreal_model', value)
			setCustomModel('')
		}
	}, [])

	const handleCustomModelChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setCustomModel(value)
		if (value.trim()) {
			localStorage.setItem('makeitreal_model', value.trim())
		}
	}, [])

	const handleSettingsClick = useCallback(() => {
		setIsOpen(!isOpen)
	}, [isOpen])

	const getCurrentModelDisplay = () => {
		if (selectedModel === 'custom') {
			return customModel || 'Custom Model'
		}
		return POPULAR_MODELS.find((m) => m.value === selectedModel)?.label || selectedModel
	}

	return (
		<div className="model-settings">
			<button
				className="settings__button"
				onClick={handleSettingsClick}
				onPointerDown={stopEventPropagation}
				title="Model Settings"
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<circle cx="12" cy="12" r="3" />
					<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
				</svg>
			</button>

			{isOpen && (
				<div className="settings__overlay" onClick={() => setIsOpen(false)}>
					<div className="settings__dialog" onClick={(e) => e.stopPropagation()}>
						<div className="settings__header">
							<h3>Model Selection</h3>
							<button className="settings__close" onClick={() => setIsOpen(false)}>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						</div>

						<div className="settings__content">
							<div className="settings__field">
								<label htmlFor="model-select">Choose Model:</label>
								<select id="model-select" value={selectedModel} onChange={handleModelChange}>
									{POPULAR_MODELS.map((model) => (
										<option key={model.value} value={model.value}>
											{model.label}
										</option>
									))}
								</select>
							</div>

							{selectedModel === 'custom' && (
								<div className="settings__field">
									<label htmlFor="custom-model">Custom Model Name:</label>
									<input
										id="custom-model"
										type="text"
										value={customModel}
										onChange={handleCustomModelChange}
										placeholder="e.g., my-model:latest"
										autoCapitalize="off"
										spellCheck={false}
									/>
								</div>
							)}

							<div className="settings__info">
								<small>Current: {getCurrentModelDisplay()}</small>
							</div>
						</div>
					</div>
				</div>
			)}

			<style jsx>{`
				.model-settings {
					position: relative;
					display: inline-block;
				}

				.settings__button {
					background: none;
					border: none;
					cursor: pointer;
					padding: 8px;
					border-radius: 4px;
					display: flex;
					align-items: center;
					justify-content: center;
					color: var(--color-text);
					transition: background-color 0.2s;
					pointer-events: all;
				}

				.settings__button:hover {
					background-color: var(--color-muted-1);
				}

				.settings__overlay {
					position: fixed;
					inset: 0;
					z-index: 10000;
					background: rgba(0, 0, 0, 0.5);
					display: flex;
					align-items: center;
					justify-content: center;
					pointer-events: all;
				}

				.settings__dialog {
					background: var(--color-panel);
					border: 1px solid var(--color-muted-1);
					border-radius: 12px;
					box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
					min-width: 320px;
					max-width: 90vw;
					max-height: 90vh;
					overflow: hidden;
				}

				.settings__header {
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 16px 20px;
					border-bottom: 1px solid var(--color-muted-1);
				}

				.settings__close {
					background: none;
					border: none;
					cursor: pointer;
					padding: 4px;
					border-radius: 4px;
					color: var(--color-text);
					display: flex;
					align-items: center;
					justify-content: center;
				}

				.settings__close:hover {
					background-color: var(--color-muted-1);
				}

				.settings__content {
					padding: 20px;
				}

				.settings__header h3 {
					margin: 0;
					font-size: 16px;
					font-weight: 600;
					color: var(--color-text);
				}

				.settings__field {
					margin-bottom: 12px;
				}

				.settings__field label {
					display: block;
					margin-bottom: 4px;
					font-size: 12px;
					color: var(--color-text-1);
					font-weight: 500;
				}

				.settings__field select,
				.settings__field input {
					width: 100%;
					padding: 6px 8px;
					border: 1px solid var(--color-muted-1);
					border-radius: 4px;
					background: var(--color-low);
					color: var(--color-text);
					font-size: 12px;
					font-family: inherit;
				}

				.settings__field select:focus,
				.settings__field input:focus {
					outline: none;
					border-color: var(--color-selected);
				}

				.settings__info {
					border-top: 1px solid var(--color-muted-1);
					padding-top: 8px;
					margin-top: 8px;
				}

				.settings__info small {
					color: var(--color-text-1);
					font-size: 11px;
				}
			`}</style>
		</div>
	)
}
