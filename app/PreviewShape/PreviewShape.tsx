/* eslint-disable react-hooks/rules-of-hooks */
import { ReactElement, useState, useEffect, useRef } from 'react'
import {
	TLBaseShape,
	BaseBoxShapeUtil,
	useIsEditing,
	useToasts,
	useValue,
	HTMLContainer,
	toDomPrecision,
	DefaultSpinner,
	stopEventPropagation,
	SvgExportContext,
	Vec,
	TldrawUiIcon,
} from 'tldraw'

export type PreviewShape = TLBaseShape<
	'response',
	{
		html: string
		w: number
		h: number
	}
>

export class PreviewShapeUtil extends BaseBoxShapeUtil<PreviewShape> {
	static override type = 'response' as const

	getDefaultProps(): PreviewShape['props'] {
		return {
			html: '',
			w: (960 * 2) / 3,
			h: (540 * 2) / 3,
		}
	}

	override canEdit = () => true
	override isAspectRatioLocked = () => false
	override canResize = () => true
	override canBind = () => false

	override component(shape: PreviewShape) {
		const isEditing = useIsEditing(shape.id)
		const toast = useToasts()
		const [viewMode, setViewMode] = useState<'rendered' | 'code'>('rendered')
		const [isMenuOpen, setIsMenuOpen] = useState(false)
		const menuRef = useRef<HTMLDivElement | null>(null)
		const menuButtonRef = useRef<HTMLButtonElement | null>(null)

		const boxShadow = useValue(
			'box shadow',
			() => {
				const rotation = this.editor.getShapePageTransform(shape)!.rotation()
				return getRotatedBoxShadow(rotation)
			},
			[this.editor]
		)

		useEffect(() => {
			if (!isMenuOpen) {
				return
			}

			const handlePointerDown = (event: PointerEvent) => {
				const target = event.target as Node
				if (menuRef.current?.contains(target) || menuButtonRef.current?.contains(target)) {
					return
				}
				setIsMenuOpen(false)
			}

			const handleKeyDown = (event: KeyboardEvent) => {
				if (event.key === 'Escape') {
					setIsMenuOpen(false)
				}
			}

			document.addEventListener('pointerdown', handlePointerDown)
			document.addEventListener('keydown', handleKeyDown)
			return () => {
				document.removeEventListener('pointerdown', handlePointerDown)
				document.removeEventListener('keydown', handleKeyDown)
			}
		}, [isMenuOpen])

		const viewToggleLabel =
			viewMode === 'rendered' ? 'Switch to code view' : 'Switch to rendered view'
		const viewToggleIcon =
			viewMode === 'rendered' ? (
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
					<polyline points="16,18 22,12 16,6" />
					<polyline points="8,6 2,12 8,18" />
				</svg>
			) : (
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
					<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
					<circle cx="8.5" cy="8.5" r="1.5" />
					<polyline points="21,15 16,10 5,21" />
				</svg>
			)

		// Kind of a hack—we're preventing users from pinching-zooming into the iframe
		const htmlToUse = shape.props.html.replace(
			`</body>`,
			`<script src="https://unpkg.com/html2canvas"></script><script>
			// send the screenshot to the parent window
  			window.addEventListener('message', function(event) {
    		if (event.data.action === 'take-screenshot' && event.data.shapeid === "${shape.id}") {
      		html2canvas(document.body, {useCors : true}).then(function(canvas) {
        		const data = canvas.toDataURL('image/png');
        		window.parent.postMessage({screenshot: data, shapeid: "${shape.id}"}, "*");
      		});
    		}
  			}, false);
			document.body.addEventListener('wheel', e => { if (!e.ctrlKey) return; e.preventDefault(); return }, { passive: false })</script>
</body>`
		)

		return (
			<HTMLContainer className="tl-embed-container" id={shape.id}>
				{htmlToUse ? (
					viewMode === 'rendered' ? (
						<iframe
							id={`iframe-1-${shape.id}`}
							srcDoc={htmlToUse}
							width={toDomPrecision(shape.props.w)}
							height={toDomPrecision(shape.props.h)}
							draggable={false}
							style={{
								pointerEvents: isEditing ? 'auto' : 'none',
								boxShadow,
								border: '1px solid var(--color-panel-contrast)',
								borderRadius: 'var(--radius-2)',
							}}
						/>
					) : (
						<pre
							style={{
								width: toDomPrecision(shape.props.w),
								height: toDomPrecision(shape.props.h),
								overflow: 'auto',
								padding: '12px',
								margin: 0,
								backgroundColor: 'var(--color-low)',
								border: '1px solid var(--color-panel-contrast)',
								borderRadius: 'var(--radius-2)',
								fontSize: '11px',
								fontFamily:
									'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
								color: 'var(--color-text)',
								lineHeight: 1.4,
								whiteSpace: 'pre-wrap',
								wordBreak: 'break-word',
								boxShadow,
							}}
						>
							{shape.props.html}
						</pre>
					)
				) : (
					<div
						style={{
							width: '100%',
							height: '100%',
							backgroundColor: 'var(--color-muted-2)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							border: '1px solid var(--color-muted-1)',
						}}
					>
						<DefaultSpinner />
					</div>
				)}

				<button
					ref={menuButtonRef}
					type="button"
					style={{
						position: 'absolute',
						top: 0,
						left: 'calc(100% + 8px)',
						height: 40,
						width: 40,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'pointer',
						pointerEvents: 'all',
						background: 'var(--color-panel)',
						border: '1px solid var(--color-muted-1)',
						borderRadius: 'var(--radius-2)',
						color: 'var(--color-text)',
						transition: 'background-color 0.2s ease, transform 0.2s ease',
					}}
					onClick={(event) => {
					event.stopPropagation()
					setIsMenuOpen((prev) => !prev)
				}}
					onPointerDown={stopEventPropagation}
					aria-haspopup="true"
					aria-expanded={isMenuOpen}
					title="Preview options"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="currentColor"
						focusable="false"
						aria-hidden="true"
					>
						<circle cx="12" cy="5" r="1.5" />
						<circle cx="12" cy="12" r="1.5" />
						<circle cx="12" cy="19" r="1.5" />
					</svg>
				</button>
				{isMenuOpen && (
					<div
						ref={menuRef}
						style={{
							position: 'absolute',
							top: 44,
							left: 'calc(100% + 8px)',
							minWidth: 190,
							padding: 8,
							background: 'var(--color-panel)',
							border: '1px solid var(--color-muted-1)',
							borderRadius: 'var(--radius-2)',
							boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
							display: 'flex',
							flexDirection: 'column',
							gap: 4,
							pointerEvents: 'all',
							zIndex: 1000,
						}}
						onPointerDown={stopEventPropagation}
					>
						<button
							type="button"
							onClick={(event) => {
								event.stopPropagation()
								setViewMode(viewMode === 'rendered' ? 'code' : 'rendered')
								setIsMenuOpen(false)
							}}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 8,
								width: '100%',
								padding: '8px 10px',
								border: 'none',
								borderRadius: 'var(--radius-2)',
								background: 'transparent',
								color: 'var(--color-text)',
								cursor: 'pointer',
								fontSize: 12,
								textAlign: 'left',
							}}
						>
							{viewToggleIcon}
							<span>{viewToggleLabel}</span>
						</button>
						<button
							type="button"
							onClick={(event) => {
								event.stopPropagation()
								if (navigator && navigator.clipboard) {
									navigator.clipboard.writeText(shape.props.html)
									toast.addToast({ icon: 'duplicate', title: 'Copied to clipboard' })
								}
								setIsMenuOpen(false)
							}}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 8,
								width: '100%',
								padding: '8px 10px',
								border: 'none',
								borderRadius: 'var(--radius-2)',
								background: 'transparent',
								color: 'var(--color-text)',
								cursor: 'pointer',
								fontSize: 12,
								textAlign: 'left',
							}}
						>
							<TldrawUiIcon icon="duplicate" />
							<span>Copy HTML</span>
						</button>
					</div>
				)}
				{htmlToUse && (
					<div
						style={{
							textAlign: 'center',
							position: 'absolute',
							bottom: isEditing ? -40 : 0,
							padding: 4,
							fontFamily: 'inherit',
							fontSize: 12,
							left: 0,
							width: '100%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							pointerEvents: 'none',
						}}
					>
						<span
							style={{
								background: 'var(--color-panel)',
								padding: '4px 12px',
								borderRadius: 99,
								border: '1px solid var(--color-muted-1)',
							}}
						>
							{isEditing ? 'Click the canvas to exit' : 'Double click to interact'}
						</span>
					</div>
				)}
			</HTMLContainer>
		)
	}

	override toSvg(shape: PreviewShape, _ctx: SvgExportContext) {
		// while screenshot is the same as the old one, keep waiting for a new one
		return new Promise<ReactElement>((resolve, reject) => {
			if (window === undefined) {
				reject()
				return
			}

			const windowListener = (event: MessageEvent) => {
				if (event.data.screenshot && event.data?.shapeid === shape.id) {
					window.removeEventListener('message', windowListener)
					clearTimeout(timeOut)

					resolve(<PreviewImage href={event.data.screenshot} shape={shape} />)
				}
			}
			const timeOut = setTimeout(() => {
				reject()
				window.removeEventListener('message', windowListener)
			}, 2000)
			window.addEventListener('message', windowListener)
			//request new screenshot
			const firstLevelIframe = document.getElementById(`iframe-1-${shape.id}`) as HTMLIFrameElement
			if (firstLevelIframe) {
				firstLevelIframe.contentWindow?.postMessage(
					{ action: 'take-screenshot', shapeid: shape.id },
					'*'
				)
			} else {
				console.error('first level iframe not found or not accessible')
			}
		})
	}

	indicator(shape: PreviewShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
	}
}

function getRotatedBoxShadow(rotation: number) {
	const cssStrings = ROTATING_BOX_SHADOWS.map((shadow) => {
		const { offsetX, offsetY, blur, spread, color } = shadow
		const vec = new Vec(offsetX, offsetY)
		const { x, y } = vec.rot(-rotation)
		return `${x}px ${y}px ${blur}px ${spread}px ${color}`
	})
	return cssStrings.join(', ')
}

function PreviewImage({ shape, href }: { shape: PreviewShape; href: string }) {
	return <image href={href} width={shape.props.w.toString()} height={shape.props.h.toString()} />
}

const ROTATING_BOX_SHADOWS = [
	{
		offsetX: 0,
		offsetY: 2,
		blur: 4,
		spread: -1,
		color: '#0000003a',
	},
	{
		offsetX: 0,
		offsetY: 3,
		blur: 12,
		spread: -2,
		color: '#0000001f',
	},
]

