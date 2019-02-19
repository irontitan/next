import execa from 'execa'
import { prompt as ask } from 'enquirer'

/**
* Try to gather user information through git commands, if we can't, then we ask
*/
export async function gatherUserInfo () {
  let userName: string
  let userEmail: string

  try {
    const { stdout: name } = await execa('git', ['config', '--get', 'user.name'], { stderr: 'ignore' })
    const { stdout: email } = await execa('git', ['config', '--get', 'user.email'], { stderr: 'ignore' })

    userName = name
    userEmail = email
  } catch (err) {
    const { name, email } = await ask([{
      type: 'input',
      name: 'name',
      message: 'What is your name?'
    }, {
      type: 'input',
      name: 'email',
      message: 'What is your email?'
    }])

    userName = name
    userEmail = email
  }

  return { userName, userEmail }
}
