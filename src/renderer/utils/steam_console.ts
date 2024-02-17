import files from './files'

export const connect = (address: string) => {
  files.start(`steam://connect/${address}`)
}

export const workshop = (workshopid: number) => {
  files.start(`steam://url/CommunityFilePage/${workshopid}`)
}

export const viewFriendsGame = (steamid: bigint) => {
  files.start(`steam://viewfriendsgame/${steamid}`)
}

export const runCsgoGame = (cvar: Json<string> = {}, args: Json<string> = {}) => {
  const argsArray: string[] = []
  for (const key in cvar) argsArray.push(`+${key} ${args[key]}`)
  for (const key in args) argsArray.push(`-${key} ${args[key]}`)
  files.start(`steam://rungame/730/76561202255233023/${argsArray.join(' ')}`)
}
