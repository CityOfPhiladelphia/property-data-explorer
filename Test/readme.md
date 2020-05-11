**Pre-requisites**

- Ensure that Node.js and npm are installed on your computer before running testcafe in commandline, then install Testcafe.(https://devexpress.github.io/testcafe/documentation/getting-started/)

**Environment setup**

- Download project to your local machine.
- Open terminal on your machine and ensure that you are in the directory of the project you want to work with. Use "cd <project file path>" for navigating to the directory.

**Running Tests Locally**

- testcafe.rc.json file has the environment setup to run the tests locally, for project availability run "npm run serve"
- tests are running with GithubActions CI.
- Using commandline make sure you are in the Test root directory then type 'npm run test-local' it will run your tests.

** Debugging **

-If a test fails in GitHub, run the tests locally. On error, the process will create screenshots in a local folder that can be used to trace which specific test failed. 

**Notes**

- screen shots are visible only when you run it in local environment. Which are mentioned in the testcafe.rc.json 
- reports are useful for local and githubActions CI. after the build finished if you expand the $cat command line to see the reports.
