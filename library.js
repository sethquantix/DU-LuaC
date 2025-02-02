const fs = require('fs-extra')
const path = require('path')  
const exists = require('fs').existsSync

const Git = require('./GitClient')
const GitUrlParse = require('git-url-parse')

const sha1 = require('sha1')
  
module.exports = class Library {

  static async saveProject (project, path) {
    return await fs.writeFile(path || 'project.json', JSON.stringify(project, null, '  '))
  }

  static projectHasLibrary (project, library) {
    for (let k in project.libs || []) {
      if (project.libs[k].id == library) return true
    }
    return false
  }

  static projectHasBuild (project, build) {
    return !!project.builds[build]
  }

  static projectHasTarget (project, target) {
    return !!project.targets[target]
  }

  static async loadExternalLibrary (gitUrl, libDir, destDir) {
    // Tries to parse Git URL
    const gitInfo = GitUrlParse(gitUrl)

    // Destination or default to temp
    const destination = destDir || path.join(__dirname, 'temp/' + sha1(gitUrl))

    // If no destination set and temp exists, recreate it
    if (!destDir) {
      if (exists(destination)) {
        await fs.rmdir(destination, { recursive: true })
      }
      await fs.mkdir(destination, { recursive: true })
    } else {
      if (!exists(path.dirname(destination))) {
        await fs.mkdir(path.dirname(destination), { recursive: true })
      }
    }

    // Validates, protocol MUST NOT be 'file' as it may point to an invalid local path
    if (gitInfo && gitInfo.protocol && 'file' != gitInfo.protocol) {
      // Logs information
      console.info(`Downloading library files from: "${gitUrl}"`)

      // The clone result will go here
      let cloneResult = null

      // Tries to download library via supplied URL
      try {
        cloneResult = Git.clone(gitUrl, destination)
      } catch (e) {
        // Tries to download library via SSH
        try {
          // Gets the SSH Git URL
          const gitSSH = `git@${gitInfo.resource}:${gitInfo.full_name}.git`

          // Attempts clone again
          cloneResult = Git.clone(gitSSH, destination)
        } catch (e) {
          console.error(`Error while fetching repository from Git:`, e)
          console.error(`Make sure you have the right access permissions to your repository and, if you're cloning via the SSH URL, you have the proper public and private keys set`)
          console.error(`Also, make sure the following Git path is correct:`, gitUrl)
          process.exit(1)
        }
      }

      // If no results are found, fail
      if (!cloneResult) return null

      // Checks if project exists
      let libInfo = null;
      if (Library.checkProjectFileExists(destination)) {
        // Parses the library info!
        libInfo = { type: 'project', ...(await Library.getProjectInfo(destination)) }
        console.info(`Loaded library: ${libInfo.name}`);
      } else {
        // Handles raw libraries (when we have Lua code but not a DU-Lua project)
        const projectName = `@${gitInfo.full_name}`;
        console.info(`No project.json file found, loading library as raw source instead`);
        libInfo = {
          type: 'raw',
          name: projectName,
        }
      }

      // Only moves if no destination is provided!
      if (!destDir) {
        // Gets names
        const destName = path.join(libDir, libInfo.name)

        // Removes existing library if existing
        if (exists(destName)) {
          await fs.rmdir(destName, { recursive: true })
        }

        // Creates destination parent dir if not existing
        if (!exists(destName)) {
          await fs.mkdir(path.dirname(destName), { recursive: true })
        }

        // Does the move
        await fs.move(destination, destName)

        // Adds a proper path to it
        libInfo.path = destName
      }

      // Returns library info
      return libInfo
    } else {
      // Fails
      return null
    }
  }

  // Checks if project exists on path
  static checkProjectFileExists (directory) {
    return exists(path.join(directory, 'project.json'));
  }

  // Helper to get current project
  static async getProjectInfo (directory) {
    // Checks for existing project file
    if (!Library.checkProjectFileExists(directory)) {
      console.error(`Project file not found "${path.join(directory, 'project.json')}"! Please, run "du-lua init" first!`)
      process.exit(1)
    }

    // Loads project
    return JSON.parse((await fs.readFile(path.join(directory, 'project.json'))).toString())
  }

}