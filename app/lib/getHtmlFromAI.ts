import { PreviewShape } from '../PreviewShape/PreviewShape'
import { SYSTEM_PROMPT, USER_PROMPT_WITH_PREVIOUS_DESIGN, USER_PROMPT } from '../prompt'

function getSelectedModel(): string {
	if (typeof window === 'undefined') return 'qwen3:8b' // SSR fallback
	return localStorage.getItem('makeitreal_model') || 'qwen3:8b'
}

export async function getHtmlFromAI({
	image,
	apiKey,
	text,
	theme = 'light',
	previousPreviews = [],
}: {
	image: string
	apiKey: string
	text: string
	theme?: string
	previousPreviews?: PreviewShape[]
}) {
	if (!apiKey) throw Error('You need to provide an API endpoint (sorry)')

	// Build the prompt text for Ollama
	let promptText = SYSTEM_PROMPT + '\n\n'
	promptText += previousPreviews?.length > 0 ? USER_PROMPT_WITH_PREVIOUS_DESIGN : USER_PROMPT
	promptText += '\n\n'

	// Add the strings of text
	if (text) {
		promptText += `Here's a list of text that we found in the design:\n${text}\n\n`
	}

	// Add the previous previews as HTML
	for (let i = 0; i < previousPreviews.length; i++) {
		const preview = previousPreviews[i]
		promptText += `The designs also included one of your previous result. Here's the image that you used as its source:\n`
		promptText += `And here's the HTML you came up with for it: ${preview.props.html}\n\n`
	}

	// Prompt the theme
	promptText += `Please make your result use the ${theme} theme.\n\n`

	// Extract base64 image data from the data URL
	const base64Image = image.split(',')[1]

	const selectedModel = getSelectedModel()
	const body: OllamaGenerateRequest = {
		model: selectedModel,
		prompt: promptText,
		images: [base64Image],
		stream: false,
		options: {
			temperature: 0,
			seed: 42,
		},
	}

	console.log('Model used:', body.model, 'Data sent:', body)

	let json = null

	try {
		const resp = await fetch(apiKey, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			mode: 'cors',
			body: JSON.stringify(body),
		})
		json = await resp.json()

		// Transform Ollama response to match OpenAI format
		if (json && json.response) {
			json = {
				choices: [
					{
						message: {
							content: json.response,
						},
					},
				],
			}
		}
	} catch (e: any) {
		throw Error(`Could not contact Ollama: ${e.message}`)
	}

	return json
}

export type OllamaGenerateRequest = {
	model: string
	prompt: string
	images?: string[]
	stream?: boolean
	options?: {
		temperature?: number
		seed?: number
		top_p?: number
		max_tokens?: number
	}
}

export type OllamaGenerateResponse = {
	response: string
	done: boolean
	context?: number[]
	total_duration?: number
	load_duration?: number
	prompt_eval_count?: number
	prompt_eval_duration?: number
	eval_count?: number
	eval_duration?: number
}
