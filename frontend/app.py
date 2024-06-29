from flask import Flask, render_template, request, redirect, url_for, jsonify # type: ignore
import requests # type: ignore
import os

app = Flask(__name__)

# Definindo as variáveis de ambiente
API_BASE_URL = os.getenv("API_BASE_URL" , "http://localhost:5000/api/v1/animal")
API_DATABASE_RESET = os.getenv("API_DATABASE_RESET" , "http://localhost:5000/api/v1/database/reset") 

# Rota para a página inicial
@app.route('/')
def index():
    return render_template('index.html')

# Rota para exibir o formulário de cadastro
@app.route('/inserir', methods=['GET'])
def inserir_animal_form():
    return render_template('inserir.html')

# Rota para enviar os dados do formulário de cadastro para a API
@app.route('/inserir', methods=['POST'])
def inserir_animal():
    nome = request.form['nome']
    especie = request.form['especie']
    sexo = request.form['sexo']
    raca = request.form['raca']
    cor = request.form['cor']
    nascimento = request.form['nascimento']
    microchip = request.form['microchip']

    payload = {
        'nome': nome,
        'especie': especie,
        'sexo': sexo,
        'raca': raca,
        'cor': cor,
        'nascimento': nascimento,
        'microchip': microchip
    }

    response = requests.post(f'{API_BASE_URL}/inserir', json=payload)
    
    if response.status_code == 201:
        return redirect(url_for('listar_animais'))
    else:
        return "Erro ao inserir animal", 500

# Rota para listar todos os animais
@app.route('/listar', methods=['GET'])
def listar_animais():
    response = requests.get(f'{API_BASE_URL}/listar')
    animais = response.json()
    return render_template('listar.html', animais=animais)

# Rota para exibir o formulário de edição de animal
@app.route('/atualizar/<int:animal_id>', methods=['GET'])
def atualizar_animal_form(animal_id):
    response = requests.get(f"{API_BASE_URL}/listar")
    #filtrando apenas o animal correspondente ao ID
    animais = [animal for animal in response.json() if animal['id'] == animal_id]
    if len(animais) == 0:
        return "Animal não encontrado", 404
    animal = animais[0]
    return render_template('atualizar.html', animal=animal)

# Rota para enviar os dados do formulário de edição de animal para a API
@app.route('/atualizar/<int:animal_id>', methods=['POST'])
def atualizar_animal(animal_id):
    nome = request.form['nome']
    especie = request.form['especie']
    sexo = request.form['sexo']
    raca = request.form['raca']
    cor = request.form['cor']
    nascimento = request.form['nascimento']
    microchip = request.form['microchip']

    payload = {
        'id': animal_id,
        'nome': nome,
        'especie': especie,
        'sexo': sexo,
        'raca': raca,
        'cor': cor,
        'nascimento': nascimento,
        'microchip': microchip
    }

    response = requests.post(f"{API_BASE_URL}/atualizar", json=payload)
    
    if response.status_code == 200:
        return redirect(url_for('listar_animais'))
    else:
        return "Erro ao atualizar animal", 500

# Rota para excluir um animal
@app.route('/excluir/<int:animal_id>', methods=['POST'])
def excluir_animal(animal_id):
    #payload = {'id': animal_id}
    payload = {'id': animal_id}

    response = requests.post(f"{API_BASE_URL}/excluir", json=payload)
    
    if response.status_code == 200  :
        return redirect(url_for('listar_animais'))
    else:
        return "Erro ao excluir animal", 500

#Rota para resetar o database
@app.route('/reset-database', methods=['GET'])
def resetar_database():
    response = requests.delete(API_DATABASE_RESET)
    
    if response.status_code == 200  :
        return redirect(url_for('index'))
    else:
        return "Erro ao resetar o database", 500


if __name__ == '__main__':
    app.run(debug=True, port=3000, host='0.0.0.0')
