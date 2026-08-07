
FROM maven:3.9-eclipse-temurin-21-alpine AS build

WORKDIR /app


COPY pom.xml ./
RUN mvn dependency:go-offline -B


COPY src ./src
RUN mvn clean package -DskipTests -B


FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]


# cd "C:\Users\arkka\Dropbox\enaa\repo\full stack\LogiTrack\LogiTrack-Part2-securite\Backend\logitrackAPP"
  #docker build -t logitrack-backend .



  #docker run --rm --name logitrack-backend -p 8080:8080 `
     #  -e SPRING_DATASOURCE_URL="jdbc:mysql://host.docker.internal:3306/logitrack?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC" `
     #  -e SPRING_DATASOURCE_USERNAME="root" `
     #  -e SPRING_DATASOURCE_PASSWORD="123456789" `
     #  -e APP_JWT_SECRET="VOTRE_CLE_JWT" `
     #  logitrack-backend