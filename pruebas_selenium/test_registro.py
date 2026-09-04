from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

options = Options()
options.add_argument("--start-maximized")

driver = webdriver.Chrome(options=options)
wait = WebDriverWait(driver, 20)

try:
    driver.get("http://localhost:4200/register")

    campo_nombre = wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//input[@placeholder='Nombre completo']")
        )
    )
    campo_nombre.send_keys("Usuario Selenium")

    campo_email = wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//input[@placeholder='Correo electrónico']")
        )
    )

    correo = (
        "usuario.selenium."
        + str(int(time.time()))
        + "@example.com"
    )

    campo_email.send_keys(correo)

    campo_password = wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//input[@placeholder='Contraseña']")
        )
    )
    campo_password.send_keys("Selenium123456")

    campo_confirmar = wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//input[@placeholder='Confirmar contraseña']")
        )
    )
    campo_confirmar.send_keys("Selenium123456")

    radio_usuario = wait.until(
        EC.element_to_be_clickable(
            (
                By.XPATH,
                "//input[@name='tipo_usuario'][@value='usuario']"
            )
        )
    )
    radio_usuario.click()

    boton_registro = wait.until(
        EC.element_to_be_clickable(
            (
                By.XPATH,
                "//button[contains(., 'Crear cuenta')]"
            )
        )
    )

    driver.execute_script(
        "arguments[0].click();",
        boton_registro
    )

    alerta = wait.until(EC.alert_is_present())

    if alerta.text == "Usuario registrado correctamente":
        alerta.accept()
    else:
        alerta.accept()
        raise Exception("Mensaje de registro incorrecto")

    wait.until(
        lambda driver: "/home" in driver.current_url
    )

    print("========================================")
    print("CA-003: REGISTRO DE USUARIO")
    print("RESULTADO: PASSED")
    print("========================================")

except Exception:
    print("========================================")
    print("CA-003: REGISTRO DE USUARIO")
    print("RESULTADO: FAILED")
    print("========================================")

finally:
    driver.quit()