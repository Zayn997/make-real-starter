import { useEditor, useToasts } from 'tldraw'
import { useCallback } from 'react'
import { makeReal } from '../lib/makeReal'

export function MakeRealButton() {
	const editor = useEditor()
	const { addToast } = useToasts()

	const handleClick = useCallback(async () => {
		try {
			const input = document.getElementById('ollama_endpoint_input') as HTMLInputElement
			const apiKey = input?.value ?? null
			console.log('Make Real clicked, apiKey:', apiKey)
			if (!apiKey) throw Error('Make sure you include your Ollama endpoint URL!')
			await makeReal(editor, apiKey)
		} catch (e) {
			console.error(e)
			addToast({
				icon: 'info-circle',
				title: 'Something went wrong',
				description: (e as Error).message.slice(0, 100),
			})
		}
	}, [editor, addToast])

	return (
		<button className="makeRealButton" onClick={handleClick}>
			Make Real
		</button>
	)
}
