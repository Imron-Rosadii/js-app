pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'imronrosadii'  // Docker Hub username
        IMAGE_TAG = "${BUILD_NUMBER}"
        IMAGE_BACKEND = "${DOCKER_REGISTRY}/express-backend:${IMAGE_TAG}"
        IMAGE_FRONTEND = "${DOCKER_REGISTRY}/react-frontend:${IMAGE_TAG}"
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
                                docker build -t ${IMAGE_BACKEND} .
                                docker tag ${IMAGE_BACKEND} ${DOCKER_REGISTRY}/express-backend:latest
                            """
                        }
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        dir('react-frontend') {
                            bat """
                                docker build -t ${IMAGE_FRONTEND} .
                                docker tag ${IMAGE_FRONTEND} ${DOCKER_REGISTRY}/react-frontend:latest
                            """
                        }
                    }
                }
            }
        }
        
        stage('Push to Docker Registry') {
            parallel {
                stage('Push Backend') {
                    steps {
                        script {
                            docker.withRegistry('', 'docker-hub-credentials') {
                                bat """
                                    docker push ${IMAGE_BACKEND}
                                    docker push ${DOCKER_REGISTRY}/express-backend:latest
                                """
                            }
                        }
                    }
                }
                stage('Push Frontend') {
                    steps {
                        script {
                            docker.withRegistry('', 'docker-hub-credentials') {
                                bat """
                                    docker push ${IMAGE_FRONTEND}
                                    docker push ${DOCKER_REGISTRY}/react-frontend:latest
                                """
                            }
                        }
                    }
                }
            }
        }
        
        stage('Deploy to Development') {
            steps {
                bat """
                    echo Deploying to Development...
                    kubectl set image -n dev deployment/backend express-backend=${IMAGE_BACKEND}
                    kubectl set image -n dev deployment/frontend react-frontend=${IMAGE_FRONTEND}
                    kubectl rollout status -n dev deployment/backend --timeout=5m
                    kubectl rollout status -n dev deployment/frontend --timeout=5m
                """
            }
        }
        
        stage('Deploy to Staging') {
            input {
                message 'Deploy to Staging?'
                ok 'Deploy'
            }
            steps {
                bat """
                    echo Deploying to Staging...
                    kubectl set image -n staging deployment/backend express-backend=${IMAGE_BACKEND}
                    kubectl set image -n staging deployment/frontend react-frontend=${IMAGE_FRONTEND}
                    kubectl rollout status -n staging deployment/backend --timeout=5m
                    kubectl rollout status -n staging deployment/frontend --timeout=5m
                """
            }
        }
        
        stage('Deploy to Production') {
            input {
                message 'Deploy to Production?'
                ok 'Deploy'
                submitter 'admin'
            }
            steps {
                bat """
                    echo Deploying to Production...
                    kubectl set image -n production deployment/backend express-backend=${IMAGE_BACKEND}
                    kubectl set image -n production deployment/frontend react-frontend=${IMAGE_FRONTEND}
                    kubectl rollout status -n production deployment/backend --timeout=5m
                    kubectl rollout status -n production deployment/frontend --timeout=5m
                """
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