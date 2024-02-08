# Use the official Eclipse Temurin (Adoptium) image for JDK 17
FROM eclipse-temurin:17-jdk as build

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven/Gradle build file to the container
# This example assumes a Maven project; adjust for Gradle if needed
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Optionally, download dependencies to improve subsequent build times
RUN ./mvnw dependency:go-offline

# Copy the rest of your application's code
COPY src src

# Build the application
RUN ./mvnw package -DskipTests

# Use the Eclipse Temurin JRE 17 image for a smaller final image
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy the jar file from the previous stage
COPY --from=build /app/target/*.jar app.jar

# Command to run the application
CMD ["java", "-jar", "app.jar"]
