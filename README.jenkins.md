# Testing Jenkins Pipeline Locally

This guide will help you test the Jenkins pipeline locally using Docker.

## Prerequisites

- Docker
- Docker Compose
- Git

## Steps to Test the Pipeline

1. **Start Jenkins Container**

   ```bash
   docker-compose up -d
   ```

2. **Get Jenkins Initial Admin Password**

   ```bash
   docker-compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```

3. **Access Jenkins**

   - Open your browser and go to `http://localhost:8080`
   - Enter the initial admin password from step 2
   - Install suggested plugins
   - Create an admin user

4. **Configure Node.js in Jenkins**

   - Go to "Manage Jenkins" > "Global Tool Configuration"
   - Add NodeJS installation
   - Name it "nodejs"
   - Select the latest LTS version
   - Save the configuration

5. **Create a New Pipeline Job**

   - Click "New Item"
   - Enter a name for your job
   - Select "Pipeline"
   - Click OK
   - In the pipeline configuration:
     - Select "Pipeline script from SCM"
     - Choose "Git"
     - Enter your repository URL
     - Set the branch to \*/main (or your default branch)
     - Set the script path to "Jenkinsfile"
   - Click Save

6. **Run the Pipeline**
   - Click "Build Now" on your pipeline job
   - Monitor the build progress in the console output

## Troubleshooting

- If you need to restart Jenkins:

  ```bash
  docker-compose restart
  ```

- To view Jenkins logs:

  ```bash
  docker-compose logs -f jenkins
  ```

- To clean up and start fresh:
  ```bash
  docker-compose down -v
  docker-compose up -d
  ```

## Notes

- The pipeline will run your backend tests using Jest
- Test results will be archived as JUnit XML reports
- The workspace will be cleaned after each build
