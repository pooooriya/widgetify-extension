import { getFromStorage, setToStorage } from '@/common/storage'
import { Button } from '@/components/button/button'
import { useGeneralSetting } from '@/context/general-setting.context'
import { useEffect, useState } from 'react'
import { FaCog } from 'react-icons/fa'
import { AnalogClock } from './clocks/analog.clock'
import { DigitalClock } from './clocks/digital.clock'
import { ClockSettingsModal } from './components/clock-settings-modal'

const dayIcon = 'https://widgetify-ir.storage.c2.liara.space/weather/01d.png'
const nightIcon = 'https://widgetify-ir.storage.c2.liara.space/weather/01n.png'

export enum ClockType {
	Analog = 'analog',
	Digital = 'digital',
}
export interface ClockSettings {
	clockType: ClockType
	showSeconds: boolean
	showTimeZone: boolean
}

export function ClockDisplay() {
	const [clockSettings, setClockSettings] = useState<ClockSettings | null>(null)
	const { timezone } = useGeneralSetting()
	const [time, setTime] = useState(
		new Date(new Date().toLocaleString('en-US', { timeZone: timezone.value }))
	)
	const [isSettingsOpen, setIsSettingsOpen] = useState(false)

	useEffect(() => {
		const timer = setInterval(() => {
			setTime(
				new Date(new Date().toLocaleString('en-US', { timeZone: timezone.value }))
			)
		}, 1000)
		return () => clearInterval(timer)
	}, [timezone])

	useEffect(() => {
		async function load() {
			const clockFromStore = await getFromStorage('clock')
			if (clockFromStore) {
				setClockSettings(clockFromStore)
			} else {
				setClockSettings({
					clockType: ClockType.Digital,
					showSeconds: false,
					showTimeZone: true,
				})
			}
		}

		load()
	}, [])

	if (!clockSettings) {
		return null
	}

	const isDayTime = time.getHours() >= 6 && time.getHours() < 18

	async function updateClockSetting(newSetting: ClockSettings) {
		setClockSettings(newSetting)
		await setToStorage('clock', newSetting)
		setIsSettingsOpen(false)
	}

	return (
		<div className="relative flex flex-col items-center px-2 py-1 overflow-hidden border border-b-0 rounded bg-content border-content">
			<div className="flex items-center justify-between w-full mb-2">
				<div
					className="w-4 h-4 transition-all duration-500 ease-out transform scale-100 opacity-40"
					style={{
						animation: 'fadeInScale 0.5s ease-out',
					}}
					key={isDayTime ? 'day' : 'night'}
				>
					<img
						src={isDayTime ? dayIcon : nightIcon}
						alt={isDayTime ? 'Day' : 'Night'}
						className="object-contain w-full h-full"
					/>
				</div>

				<Button
					onClick={() => setIsSettingsOpen(true)}
					size="xs"
					className="p-1 transition-colors rounded opacity-50 btn-ghost hover:bg-gray-500/20"
				>
					<FaCog className="w-3 h-3 text-content opacity-60 hover:opacity-100" />
				</Button>
			</div>

			<div className="flex flex-col items-center justify-center flex-grow">
				{clockSettings.clockType === 'analog' ? (
					<AnalogClock
						time={time}
						isDayTime={isDayTime}
						timezone={timezone}
						setting={clockSettings}
					/>
				) : (
					<DigitalClock
						time={time}
						isDayTime={isDayTime}
						timezone={timezone}
						setting={clockSettings}
					/>
				)}
			</div>

			<div className="absolute inset-0 pointer-events-none">
				{[...Array(3)].map((_, i) => (
					<div
						key={i}
						className={`absolute w-1 h-1 rounded-full ${isDayTime ? 'bg-yellow-300' : 'bg-blue-300'} opacity-30 transition-colors duration-500`}
						style={{
							left: `${10 + i * 30}%`,
							top: `${40 + i * 20}%`,
							animation: `floatParticle${i + 1} ${2 + i * 0.5}s ease-in-out infinite`,
							animationDelay: `${i * 0.5}s`,
						}}
					/>
				))}
			</div>

			<style>
				{`
					@keyframes fadeInScale {
						0% {
							opacity: 0;
							transform: scale(0) rotate(-180deg);
						}
						100% {
							opacity: 0.4;
							transform: scale(1) rotate(0deg);
						}
					}

					@keyframes floatParticle1 {
						0%, 100% {
							transform: translateY(0px);
							opacity: 0.3;
						}
						50% {
							transform: translateY(-10px);
							opacity: 0.6;
						}
					}

					@keyframes floatParticle2 {
						0%, 100% {
							transform: translateY(0px);
							opacity: 0.3;
						}
						50% {
							transform: translateY(-8px);
							opacity: 0.7;
						}
					}

					@keyframes floatParticle3 {
						0%, 100% {
							transform: translateY(0px);
							opacity: 0.3;
						}
						50% {
							transform: translateY(-12px);
							opacity: 0.5;
						}
					}
				`}
			</style>

			{/* Settings Modal */}
			<ClockSettingsModal
				isOpen={isSettingsOpen}
				onClose={(val) => updateClockSetting(val)}
				clockSetting={clockSettings}
			/>
		</div>
	)
}
