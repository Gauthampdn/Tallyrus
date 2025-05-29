pipeline {
    agent any

    tools {
        nodejs 'nodejs'
    }

    environment {
        NODE_ENV = 'test'
        GOOGLE_CLIENT_ID = credentials('GOOGLE_CLIENT_ID')
        GOOGLE_CLIENT_SECRET = credentials('GOOGLE_CLIENT_SECRET')
        GIT_CREDENTIALS = credentials('git-credentials')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Run Tests') {
            steps {
                dir('backend') {
                    sh 'npm test -- --reporters=default --reporters=jest-junit'
                }
            }
            post {
                always {
                    junit 'backend/junit.xml'
                }
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'  // Only deploy when changes are on main branch
                expression { 
                    return currentBuild.result == 'SUCCESS' 
                }
            }
            steps {
                script {
                    // Configure git with credentials
                    sh '''
                        git config --global user.email "jenkins@example.com"
                        git config --global user.name "Jenkins"
                    '''
                    
                    // Switch to production branch and merge changes
                    sh '''
                        git checkout prod
                        git merge main --no-edit
                        git push origin prod
                    '''
                }
            }
            post {
                success {
                    echo 'Successfully deployed to production!'
                }
                failure {
                    echo 'Failed to deploy to production!'
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Build and tests completed successfully!'
        }
        failure {
            echo 'Build or tests failed!'
        }
    }
} 