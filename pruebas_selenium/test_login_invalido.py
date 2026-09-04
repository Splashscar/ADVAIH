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
    driver.get("http://localhost:4200/")

    # Ingresar correo inválido
    campo_email = wait.until(
        EC.visibility_of_element_located((By.NAME, "email"))
    )
    campo_email.send_keys(
        "correo_incorrecto_selenium_999999@example.com"
    )

    # Ingresar contraseña inválida
    campo_password = wait.until(
        EC.visibility_of_element_located((By.NAME, "password"))
    )
    campo_password.send_keys(
        "ContraseñaIncorrecta999999"
    )

    # Clic en iniciar sesión
    boton_login = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Iniciar sesión')]")
        )
    )
    boton_login.click()

    # Esperar respuesta de Firebase
    time.sleep(5)

    if "/home" not in driver.current_url:

        
        print("CA-002: LOGIN CON CREDENCIALES INVALIDAS")
        print("RESULTADO: PRUEBA EXITOSA")

    else:

        print("CA-002: LOGIN CON CREDENCIALES INVALIDAS")
        print("RESULTADO: FAILED")

except Exception:

    print("CA-002: LOGIN CON CREDENCIALES INVALIDAS")
    print("RESULTADO: FAILED")


finally:
    #input("\nPresiona ENTER para cerrar el navegador...")
    driver.quit()