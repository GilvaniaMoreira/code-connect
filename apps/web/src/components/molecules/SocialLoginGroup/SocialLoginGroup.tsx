import { Divider } from '../../atoms/Divider'
import { SocialLoginButton } from '../SocialLoginButton'

export function SocialLoginGroup() {
  return (
    <div className="flex flex-col gap-4">
      <Divider>ou entre com outras contas</Divider>
      <div className="flex items-center justify-center gap-6">
        <SocialLoginButton provider="Github" iconSrc="/Github.png" />
        <SocialLoginButton provider="Gmail" iconSrc="/Google.png" />
      </div>
    </div>
  )
}
