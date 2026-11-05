// ProyectoBaseTest.java
package pe.bcp.login;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import io.quarkus.test.junit.QuarkusTest;

@QuarkusTest
class ProyectoBaseTest {

    @Test
    void ca2_positivo_java21() {
        assertEquals(
                "21",
                System.getProperty("java.specification.version"),
                "El runtime de pruebas debe ser Java 21.");
    }
}