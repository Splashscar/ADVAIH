from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


# Configuración de Chrome
options = Options()
options.add_argument("--start-maximized")

driver = webdriver.Chrome(options=options)

try:
    # Abrir la página de login
    driver.get("http://localhost:4200/")

    # Esperar hasta que aparezca el campo de correo
    wait = WebDriverWait(driver, 15)

    campo_email = wait.until(
        EC.visibility_of_element_located((By.NAME, "email"))
    )

    # Escribir correo de prueba
    campo_email.send_keys("alexisalexis13724@gmail.com")

    # Esperar campo de contraseña
    campo_password = wait.until(
        EC.visibility_of_element_located((By.NAME, "password"))
    )

    # Escribir contraseña de prueba
    campo_password.send_keys("123456789")

    # Esperar botón de iniciar sesión
    boton_login = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(), 'Iniciar sesión')]")
        )
    )

    boton_login.click()

    # Esperar hasta que Angular navegue a /home
    wait.until(EC.url_contains("/home"))

    # Verificación final
    assert "/home" in driver.current_url

    print("CA-001: LOGIN CON CREDENCIALES VALIDAS")
    print("RESULTADO: PRUEBA EXITOSA")
    print("URL FINAL:", driver.current_url)
    
except Exception as error:

    print("CA-001: LOGIN CON CREDENCIALES VALIDAS")
    print("RESULTADO: FAILED")
    print("ERROR:", error)
    print("URL ACTUAL:", driver.current_url)
    
finally:
    #input("\nPresiona ENTER para cerrar el navegador...")
    driver.quit()
    
    