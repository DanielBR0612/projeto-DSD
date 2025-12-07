FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY . /workspace
# Use the Maven wrapper if present, otherwise use mvn from the image
RUN if [ -x ./mvnw ]; then ./mvnw -B -DskipTests package; else mvn -B -DskipTests package; fi

FROM eclipse-temurin:21-jre
WORKDIR /app
# Copy the built jar (wildcard in case of different artifact names)
COPY --from=build /workspace/target/*.jar /app/app.jar
EXPOSE 8081
ENTRYPOINT ["java","-jar","/app/app.jar"]
