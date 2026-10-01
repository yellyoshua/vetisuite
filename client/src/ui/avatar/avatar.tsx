import useAvatar, { type AvatarProps } from './avatar.handlers'

export default function Avatar(props: AvatarProps) {
  const { rootProps, showImage, imageProps, initials } = useAvatar(props)

  return <span {...rootProps}>{showImage ? <img {...imageProps} /> : <span aria-hidden="true">{initials}</span>}</span>
}
