import { useEffect, useState } from 'endr'
import './App.css'
import JTLogo from './assets/jtlogo.png'
import SpikeLogo from './assets/spikelogo.png'
import Button from './Button'
import { Profile } from './App'

const ProfileTile = ({
  profile,
  itemCount,
  index,
  onClick,
  size,
}: {
  profile: Profile
  index: number
  onClick: () => void
  itemCount: number
  size: { width: number; height: number }
}) => {
  const [isPressed, setIsPressed] = useState(false)
  const handlePointerDown = () => setIsPressed(true)
  const handlePointerUp = () => setIsPressed(false)

  return (
    <div
      className={`absolute w-[5rem] p-1 items-center justify-center ${
        isPressed && 'w-[4.8rem]'
      }`}
      style={{
        left: `calc(50% + ${
          Math.cos((2 * Math.PI * index) / itemCount) * size.width
        }px)`,
        top: `calc(50% + ${
          Math.sin((2 * Math.PI * index) / itemCount) * size.height
        }px)`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <img
        className={`animate-ccw-spin rounded-xl shadow-md shadow-slate-600 ${
          isPressed && 'shadow-sm'
        }`}
        key={profile.id}
        src={profile.imageUrl}
        alt={profile.name}
        onClick={onClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  )
}

export default ({
  profiles,
  selectedProfiles,
  setSelectedProfiles,
  setLoadThunderdome,
}: {
  profiles: Profile[]
  selectedProfiles: Profile[]
  setSelectedProfiles: (profiles: Profile[]) => void
  setLoadThunderdome: (set: boolean) => void
}) => {
  const [size, setSize] = useState({
    width: window.innerWidth / 2,
    height: window.innerHeight / 2,
  })

  useEffect(() => {
    const updateSize = () => {
      setSize({
        width: window.innerHeight / 2.5,
        height: window.innerHeight / 2.5,
      })
    }
    window.addEventListener('resize', updateSize)
    updateSize()
  }, [])

  const handleProfileClick = (profile: Profile) => {
    if (selectedProfiles.length < 4 && !selectedProfiles.includes(profile)) {
      setSelectedProfiles([...selectedProfiles, profile])
    }

    if (selectedProfiles.length === 3) {
      setTimeout(() => setLoadThunderdome(true), 4000)
    }
  }

  return (
    <div className='flex overflow-hidden '>
      <div
        className='w-1/6 p-4 bg-purple-700'
        onClick={() => window.location.reload()}
      >
        <img
          src={SpikeLogo}
          className='w-full'
        />
      </div>
      <div className='relative h-screen w-3/4 items-center justify-center'>
        <div className='absolute flex w-full h-full top-0 right-0 items-center justify-center'>
          <div
            className={`relative flex h-24 w-24 rounded-full ${
              selectedProfiles.length === 4 && 'animate-exp-spin'
            }`}
            style={{
              backgroundImage: `url(${JTLogo})`,
              backgroundSize: 'cover',
            }}
          >
            {selectedProfiles.length > 0 && selectedProfiles.length !== 4 && (
              <Button
                className='absolute px-3 py-1 -bottom-2 -right-2 text-xs z-10'
                onClick={() => setSelectedProfiles([])}
              >
                reset
              </Button>
            )}
            {selectedProfiles.map((profile, index) => (
              <img
                key={profile.id}
                src={profile.imageUrl}
                alt={profile.name}
                className='absolute w-18 h-18 rounded-3xl'
                style={{
                  left: `calc(50% + ${
                    120 * Math.cos((2 * Math.PI * index) / 4)
                  }px)`,
                  top: `calc(50% + ${
                    120 * Math.sin((2 * Math.PI * index) / 4)
                  }px)`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: `${
                    index < 2 ? '0px 0px 30px red' : '0px 0px 30px blue'
                  }`,
                }}
              />
            ))}
          </div>
        </div>

        <div className='flex h-screen self-center animate-cw-spin'>
          {profiles.map((profile, index) => (
            <ProfileTile
              profile={profile}
              itemCount={profiles.length}
              index={index}
              onClick={() => handleProfileClick(profile)}
              size={size}
            />
          ))}
        </div>
      </div>
      <div className='w-1/6 bg-purple-700'></div>
    </div>
  )
}
