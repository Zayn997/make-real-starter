import { TldrawUiIcon, useBreakpoint } from 'tldraw'
import { ChangeEvent, useCallback } from 'react'

export function RiskyButCoolAPIKeyInput() {
	const breakpoint = useBreakpoint()

	const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		localStorage.setItem('makeitreal_key', e.target.value)
	}, [])

	const handleQuestionMessage = useCallback(() => {
		window.alert(
			`This app is configured to use Ollama running locally. The endpoint URL should be your Ollama API endpoint (e.g., http://localhost:11434/api/generate).\n\nMake sure you have Ollama installed and running with the gemma3:12b model available.\n\nSee https://ollama.ai for installation instructions.`
		)
	}, [])

	return (
		<div className={`your-own-api-key ${breakpoint < 5 ? 'your-own-api-key__mobile' : ''}`}>
			<div className="your-own-api-key__inner">
				<div className="input__wrapper">
					<input
						id="ollama_endpoint_input"
						defaultValue={
							process.env.NEXT_PUBLIC_API_KEY ?? localStorage.getItem('makeitreal_key') ?? ''
						}
						onChange={handleChange}
						spellCheck={false}
						autoCapitalize="off"
						placeholder="http://localhost:11434/api/generate"
					/>
				</div>
				<button className="question__button" onClick={handleQuestionMessage}>
					<TldrawUiIcon icon="question" label="Question" />
				</button>
			</div>
		</div>
	)
}
