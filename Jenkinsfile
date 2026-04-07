pipeline {
    agent any
    
    environment {
        // Docker registry configuration
        DOCKER_REGISTRY = 'imronrosadii'  // Ganti dengan username Docker Hub Anda
        IMAGE_TAG = "${BUILD_NUMBER}"
        
        // Kubernetes configuration
        KUBECONFIG_CREDENTIAL = 'kubeconfig'
    }
    
    tools {
        nodejs 'NodeJS-18'  // Pastikan NodeJS plugin terinstall
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
                            sh 'npm ci'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('react-frontend') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }
        
        stage('TypeScript Compile Check') {
            parallel {
                stage('Backend Build') {
                    steps {
                        dir('express-backend') {
                            sh 'npm run build'
                        }
                    }
                }
                stage('Frontend Build') {
                    steps {
                        dir('react-frontend') {
                            sh 'npm run build'
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
                            sh """
                                docker build -t ${DOCKER_REGISTRY}/express-backend:${IMAGE_TAG} .
                                docker tag ${DOCKER_REGISTRY}/express-backend:${IMAGE_TAG} ${DOCKER_REGISTRY}/express-backend:latest
                            """
                        }
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        dir('react-frontend') {
                            sh """
                                docker build -t ${DOCKER_REGISTRY}/react-frontend:${IMAGE_TAG} .
                                docker tag ${DOCKER_REGISTRY}/react-frontend:${IMAGE_TAG} ${DOCKER_REGISTRY}/react-frontend:latest
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
                                sh """
                                    docker push ${DOCKER_REGISTRY}/express-backend:${IMAGE_TAG}
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
                                sh """
                                    docker push ${DOCKER_REGISTRY}/react-frontend:${IMAGE_TAG}
                                    docker push ${DOCKER_REGISTRY}/react-frontend:latest
                                """
                            }
                        }
                    }
                }
            }
        }
        
        stage('Deploy to Development') {
            when {
                branch 'main'
            }
            steps {
                script {
                    try {
                        sh """
                            kubectl set image -n dev deployment/backend \
                                express-backend=${DOCKER_REGISTRY}/express-backend:${IMAGE_TAG} --record
                            kubectl set image -n dev deployment/frontend \
                                react-frontend=${DOCKER_REGISTRY}/react-frontend:${IMAGE_TAG} --record
                            kubectl rollout status -n dev deployment/backend --timeout=5m
                            kubectl rollout status -n dev deployment/frontend --timeout=5m
                        """
                    } catch (err) {
                        echo "Deployment to dev failed: ${err}"
                        // Don't fail the pipeline for dev deployment issues
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'main'
                input message: 'Deploy to Staging?', ok: 'Deploy'
            }
            steps {
                script {
                    sh """
                        kubectl set image -n staging deployment/backend \
                            express-backend=${DOCKER_REGISTRY}/express-backend:${IMAGE_TAG} --record
                        kubectl set image -n staging deployment/frontend \
                            react-frontend=${DOCKER_REGISTRY}/react-frontend:${IMAGE_TAG} --record
                        kubectl rollout status -n staging deployment/backend --timeout=5m
                        kubectl rollout status -n staging deployment/frontend --timeout=5m
                    """
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
                input message: 'Deploy to Production?', ok: 'Deploy'
            }
            steps {
                script {
                    sh """
                        kubectl set image -n production deployment/backend \
                            express-backend=${DOCKER_REGISTRY}/express-backend:${IMAGE_TAG} --record
                        kubectl set image -n production deployment/frontend \
                            react-frontend=${DOCKER_REGISTRY}/react-frontend:${IMAGE_TAG} --record
                        kubectl rollout status -n production deployment/backend --timeout=5m
                        kubectl rollout status -n production deployment/frontend --timeout=5m
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo "Pipeline succeeded! Image tag: ${IMAGE_TAG}"
        }
        failure {
            echo "Pipeline failed!"
        }
        always {
            cleanWs()
        }
    }
}
