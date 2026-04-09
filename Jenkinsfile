pipeline {
    agent any
    
    environment {
        IMAGE_TAG = "${BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Checking out from ${env.GIT_BRANCH}"
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('express-backend') {
                            bat 'npm ci'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('react-frontend') {
                            bat 'npm ci'
                        }
                    }
                }
            }
        }
        
        stage('TypeScript Compile') {
            parallel {
                stage('Backend Build') {
                    steps {
                        dir('express-backend') {
                            bat 'npm run build'
                        }
                    }
                }
                stage('Frontend Build') {
                    steps {
                        dir('react-frontend') {
                            bat 'npm run build'
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        dir('express-backend') {
                            bat """
                                docker build -t express-backend:%IMAGE_TAG% .
                                docker tag express-backend:%IMAGE_TAG% express-backend:latest
                            """
                        }
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        dir('react-frontend') {
                            bat """
                                docker build -t react-frontend:%IMAGE_TAG% .
                                docker tag react-frontend:%IMAGE_TAG% react-frontend:latest
                            """
                        }
                    }
                }
            }
        }
        
        stage('Load Images to Minikube') {
            steps {
                bat '''
                    echo Loading images to Minikube...
                    minikube image load express-backend:latest
                    minikube image load react-frontend:latest
                '''
            }
        }
        
        stage('Deploy to Development') {
            steps {
                bat '''
                    echo Deploying to Development...
                    kubectl apply -k k8s/overlays/dev
                    kubectl rollout status -n dev deployment/backend --timeout=5m
                    kubectl rollout status -n dev deployment/frontend --timeout=5m
                '''
            }
        }
        
        stage('Deploy to Staging') {
            input {
                message 'Deploy to Staging?'
                ok 'Deploy'
            }
            steps {
                bat '''
                    echo Deploying to Staging...
                    kubectl apply -k k8s/overlays/staging
                    kubectl rollout status -n staging deployment/backend --timeout=5m
                    kubectl rollout status -n staging deployment/frontend --timeout=5m
                '''
            }
        }
        
        stage('Deploy to Production') {
            input {
                message 'Deploy to Production?'
                ok 'Deploy'
            }
            steps {
                bat '''
                    echo Deploying to Production...
                    kubectl apply -k k8s/overlays/production
                    kubectl rollout status -n production deployment/backend --timeout=5m
                    kubectl rollout status -n production deployment/frontend --timeout=5m
                '''
            }
        }
    }
    
    post {
        success {
            echo "✅ Pipeline SUCCESS! Image Tag: ${IMAGE_TAG}"
        }
        failure {
            echo "❌ Pipeline FAILED!"
        }
        always {
            cleanWs()
        }
    }
}