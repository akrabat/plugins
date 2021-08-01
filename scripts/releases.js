// @flow

// $FlowIgnore
const fs = require('fs/promises')
const path = require('path')
const {
  getFolderFromCommandLine,
  runShellCommand,
  getPluginFileContents,
  fileExists,
} = require('./shared')

const installInstructions = `
In order to create a release on the Noteplan github server (so the entire community can see your plugin), you need to have the proper permissions on the github repository from @eduardme. So get that sorted out before moving any further. More than likely, you'll simply want to create a Pull Request for your plugin code to the Noteplan repository and get it reviewed so someone can create a release to get it out to the community.

If you do have permissions to create a release, then here's the next step:\n
In order to do releases from the commandline, you need the "gh" command line tool from github.
The following commands should get you up and running. Note: the first two commands may take awhile (5 minutes each) to run:
git -C /usr/local/Homebrew/Library/Taps/homebrew/homebrew-core fetch --unshallow
git -C /usr/local/Homebrew/Library/Taps/homebrew/homebrew-cask fetch --unshallow
brew update
brew install gh
gh auth login
[ Select: Github.com > HTTPS > Yes Credentials > Login with web browser ]
[ Log in using your github account and press Enter ]
[ copy the OTP code from command line ]
[ Paste OTP code in browser window ]

If the above doesn't work for you, check out the detailed instructions from github:
https://github.com/cli/cli#installation

Then, once you have "gh" installed, come back here to run the command you ran to get this message.
`

/**
 *
 * @param {string} pluginFullPath
 * @returns {Promise<{name:string,tag:string} | null>
 */
async function getExistingRelease(pluginName) {
  // const command = `gh release upload --clobber "dwertheimer.TaskAutomations" /tmp/test.txt`
  //   const command = `gh release list | grep "${releaseName}"`
  const command = `gh release list`
  console.log(`>>Releases: Getting full release list from Github`)

  const releases = await runShellCommand(command)
  //   console.log(
  //     `>>Releases Command: "${command}" returned:\n ${JSON.stringify(release)}`,
  //   )
  if (releases.length) {
    let checkForLines = []
    let failed = false
    const lines = releases.split('\n')
    console.log(
      `>>Releases: Found ${lines.length} releases. Searching for release named: "${pluginName}"`,
    )
    if (lines.length) {
      checkForLines = lines.filter((line) => line.includes(pluginName))
      if (checkForLines.length > 1 && checkForLines[1] !== '') {
        console.log(
          `>>Releases: PROBLEM: Found more than one matching release for "${pluginName}" on github\nYou will need to delete one of them on github before running this script. Go to:\n\thttps://github.com/NotePlan/plugins/releases\nand delete one of these:\n${checkForLines.join(
            '\n',
          )}`,
        )
        process.exit(0)
      } else if (checkForLines.length === 0) {
        console.log(
          `>>Releases: Did not find a pre-existing release that matched the pattern for this plugin folder: "${pluginName}" on github.\
          \nThat's ok if this is the first release. Or it could be that a pre-existing release did not match this naming convention.\
          Here are all the currently existing releases on github:\n---\n${releases}\nYou can always delete the old release at:\n\thttps://github.com/NotePlan/plugins/releases`,
        )
        failed = true
      }
    }
    if (!failed) {
      const parts = checkForLines[0].split('\t')
      if (parts.length > 3) {
        const name = parts[0]
        const tag = parts[2]
        // console.log(`>>Releases: found on github release name: ${name}`)
        console.log(`>>Releases: found on github release tagged: ${tag}`)
        return { name, tag }
      } else {
        console.log(
          `>>Releases: couldn't find proper fields in: ${JSON.stringify(
            parts,
          )}`,
        )
      }
    } else {
      return null
    }
  } else {
    console.log(`>>RELEASES: Did not find pre-existing releases.`)
  }
}

function getReleaseTagName(pluginName, version) {
  return `${pluginName}-v${version}`
}

function getVersionFromPluginJson(pluginData) {
  const version = pluginData['plugin.version'] || null
  if (!version) {
    console.log(`Could not find plugin.version in plugin.json`)
    process.exit(0)
  }
  return version
}

/**
 * @param {string} pluginFullPath
 * @returns {Promise<{ changelog: string | null, files: Array<string> }>>}
 */
async function getReleaseFileList(pluginFullPath) {
  const fileList = { changelog: null, files: [] }
  const filesInPluginFolder = await fs.readdir(pluginFullPath, {
    withFileTypes: true,
  })
  const fileLowerMatch = (str) =>
    filesInPluginFolder.filter((f) => f.name.toLowerCase() === str)
  const existingFileName = (lowercaseName) => {
    const match = fileLowerMatch(lowercaseName)
    if (match.length) {
      return match[0].name
    } else {
      return null
    }
  }
  const fullPath = (name) =>
    name ? `"${path.join(pluginFullPath, name)}"` : null

  let name
  if ((name = existingFileName('changelog.md'))) {
    fileList.changelog = fullPath(name)
  } else {
    if ((name = existingFileName('readme.md'))) {
      fileList.changelog = fullPath(name)
    } else {
      console.log(
        `>>Releases: NOTE there is no changelog or README file in ${pluginFullPath}`,
      )
    }
  }
  if ((name = existingFileName('plugin.json'))) {
    fileList.files.push(fullPath(name))
  }
  if ((name = existingFileName('script.js'))) {
    fileList.files.push(fullPath(name))
  }
  if ((name = existingFileName('readme.md'))) {
    fileList.files.push(fullPath(name))
  }
  // console.log(`>> Releases fileList:\n${JSON.stringify(fileList)}`)
  return fileList
}

function wrongArgsMessage(limitToFolders) {
  console.log(
    `>>Releases: ${
      limitToFolders ? String(limitToFolders.length) : ''
    } file(s): ${JSON.stringify(limitToFolders) || ''}`,
  )
  console.log(
    `>>Releases: Wrong # of arguments...You can only release one plugin/folder at a time!\nUsage:\n \
      npm run release "dwertheimer.dateAutomations"`,
  )
}

function ensureVersionIsNew(existingRelease, versionedTagName) {
  if (existingRelease && versionedTagName) {
    if (existingRelease.tag === versionedTagName) {
      console.log(
        `>>Releases: Found existing release with tag name: "${versionedTagName}", which matches the version number in your plugin.json. New releases always have to have a unique name/tag. Update your plugin.version in plugin.json (and changelog.md or readme.md) and try again.`,
      )
      process.exit(0)
    }
  }
}

function getReleaseCommand(version, fileList, sendToGithub = false) {
  const changeLog = fileList.changelog ? `-F ${fileList.changelog}` : ''
  return `gh release create "${version}" -t "${version}" ${changeLog} ${
    !sendToGithub ? `--draft` : ''
  } ${fileList.files.join(' ')}`
}

function getRemoveCommand(version, fileList, sendToGithub = false) {
  return `gh release delete "${version}" ${sendToGithub ? `` : '-y'}` // -y removes the release without prompting
}

async function releasePlugin(versionedTagName, fileList, sendToGithub = false) {
  const releaseCommand = getReleaseCommand(
    versionedTagName,
    fileList,
    sendToGithub,
  )
  if (!sendToGithub) {
    console.log(`\nRelease create command: \n${releaseCommand}\n`)
  } else {
    if (releaseCommand) {
      console.log(
        `>>Release: Creating release "${versionedTagName}" on github...`,
      )
      const resp = await runShellCommand(releaseCommand)
      console.log(
        `>>Releases: New release posted (check on github):\n\t${JSON.stringify(
          resp.trim(),
        )}`,
      )
    }
  }
}

async function removePlugin(versionedTagName, sendToGithub = false) {
  const removeCommand = getRemoveCommand(versionedTagName, sendToGithub)
  if (!sendToGithub) {
    console.log(`\nPrevious release remove command: \n${removeCommand}\n`)
  } else {
    if (removeCommand) {
      console.log(
        `>>Releases: Removing previous version "${versionedTagName}" on github...`,
      )
      // eslint-disable-next-line no-unused-vars
      const resp = await runShellCommand(removeCommand)
      // console.log(`...response: ${JSON.stringify(resp.trim())}`)
    }
  }
}

async function checkForGh() {
  if (!(await fileExists(`/usr/local/bin/gh`))) {
    console.log(
      `>>Releases: ERROR: Could not find "gh" command.\n${installInstructions}`,
    )
    process.exit(0)
  }
}

async function main() {
  console.log(`----------`)
  await checkForGh()
  const rootFolderPath = path.join(__dirname, '..')
  const limitToFolders = await getFolderFromCommandLine(rootFolderPath)
  if (limitToFolders.length === 1) {
    const pluginName = limitToFolders[0]
    const pluginFullPath = path.join(rootFolderPath, pluginName)
    const existingRelease = await getExistingRelease(pluginName)
    const pluginData = await getPluginFileContents(pluginFullPath)
    const versionNumber = getVersionFromPluginJson(pluginData)
    const fileList = await getReleaseFileList(pluginFullPath)
    const versionedTagName = getReleaseTagName(pluginName, versionNumber)
    // console.log(`>>Releases: This version/tag will be:\n\t${versionedTagName}`)
    ensureVersionIsNew(existingRelease, versionedTagName)
    await releasePlugin(versionedTagName, fileList, true)
    if (existingRelease) await removePlugin(existingRelease.tag, true)
    const newReleaseList = await getExistingRelease(pluginName)
    if (newReleaseList && newReleaseList.tag === versionedTagName) {
      console.log(
        `>>Releases: Release & Clean ran successfully. "${versionedTagName}" is now live.`,
      )
    } else {
      console.log(`>>Releases: Something went wrong. Pls check logs.`)
    }
  } else {
    wrongArgsMessage()
  }
}
main()
