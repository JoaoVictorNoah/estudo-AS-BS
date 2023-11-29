import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  // Estado para armazenar a lista de tarefas
  const [tarefas, setTarefas] = useState([]);
  // Estado para armazenar o nome da nova tarefa
  const [novaTarefa, setNovaTarefa] = useState('');
  // Estado para armazenar a tarefa em edição
  const [tarefaEditando, setTarefaEditando] = useState(null);
  // Estado para armazenar a nova descrição da tarefa em edição
  const [novaDescricao, setNovaDescricao] = useState('');
  // Estado para armazenar o status da tarefa em edição (concluída ou não concluída)
  const [statusConcluida, setStatusConcluida] = useState('');

  // Efeito para carregar as tarefas do backend ao iniciar a aplicação
  useEffect(() => {
    fetch('http://localhost:3030/api/tarefas')
      .then(response => response.json())
      .then(data => setTarefas(data))
      .catch(error => console.error('Erro ao buscar tarefas:', error));
  }, []);

  // Função para adicionar uma nova tarefa
  const adicionarTarefa = () => {
    fetch('http://localhost:3030/api/tarefas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nome: novaTarefa }),
    })
      .then(response => response.json())
      .then(data => {
        // Atualiza o estado com a nova tarefa adicionada
        setTarefas([...tarefas, { id: data.id, nome: novaTarefa, concluida: 0 }]);
        // Limpa o campo de entrada da nova tarefa
        setNovaTarefa('');
      })
      .catch(error => console.error('Erro ao adicionar tarefa:', error));
  };

  // Função para marcar ou desmarcar uma tarefa como concluída
  const marcarConcluida = (id, concluida) => {
    fetch(`http://localhost:3030/api/tarefas/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ concluida: concluida ? 0 : 1 }),
    })
      .then(response => response.json())
      .then(data => {
        // Atualiza o estado com a tarefa marcada/desmarcada como concluída
        setTarefas(tarefas.map(tarefa => (tarefa.id === id ? { ...tarefa, concluida: concluida ? 0 : 1 } : tarefa)));
      })
      .catch(error => console.error('Erro ao marcar tarefa como concluída:', error));
  };

  // Função para excluir uma tarefa
  const excluirTarefa = id => {
    fetch(`http://localhost:3030/api/tarefas/${id}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(data => {
        // Atualiza o estado removendo a tarefa excluída
        setTarefas(tarefas.filter(tarefa => tarefa.id !== id));
      })
      .catch(error => console.error('Erro ao excluir tarefa:', error));
  };

  // Função para abrir o modal de edição e preencher os estados correspondentes
  const abrirModalEditar = tarefa => {
    setTarefaEditando(tarefa);
    setNovaDescricao(tarefa.nome);
    setStatusConcluida(tarefa.concluida);
  };

  // Função para fechar o modal de edição e limpar os estados correspondentes
  const fecharModalEditar = () => {
    setTarefaEditando(null);
    setNovaDescricao('');
    setStatusConcluida('');
  };

  // Função para salvar as alterações feitas em uma tarefa
  const salvarEdicao = () => {
    fetch(`http://localhost:3030/api/tarefas/${tarefaEditando.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nome: novaDescricao, concluida: parseInt(statusConcluida) }),
    })
      .then(response => response.json())
      .then(data => {
        // Atualiza o estado com a tarefa editada
        setTarefas(
          tarefas.map(tarefa =>
            tarefa.id === tarefaEditando.id ? { ...tarefa, nome: novaDescricao, concluida: parseInt(statusConcluida) } : tarefa
          )
        );
        // Fecha o modal de edição
        fecharModalEditar();
      })
      .catch(error => console.error('Erro ao editar tarefa:', error));
  };

  return (
    <div className="container mt-5">
      <h1>Gerenciador de Tarefas</h1>
      <div className="mb-3">
        {/* Campo de entrada para a nova tarefa */}
        <input
          type="text"
          className="form-control"
          placeholder="Nova tarefa"
          value={novaTarefa}
          onChange={e => setNovaTarefa(e.target.value)}
        />
        {/* Botão para adicionar a nova tarefa */}
        <button className="btn btn-primary mt-2" onClick={adicionarTarefa}>
          Adicionar Tarefa
        </button>
      </div>
      <ul className="list-group">
        {/* Lista de tarefas exibidas */}
        {tarefas.map(tarefa => (
          <li key={tarefa.id} className="list-group-item d-flex justify-content-between align-items-center">
            {tarefa.nome}
            <div>
              {/* Checkbox para marcar/desmarcar a tarefa como concluída */}
              <input
                type="checkbox"
                className="form-check-input me-2"
                checked={tarefa.concluida}
                onChange={() => marcarConcluida(tarefa.id, tarefa.concluida)}
              />
              {/* Botão para abrir o modal de edição */}
              <button className="btn btn-warning btn-sm me-2" onClick={() => abrirModalEditar(tarefa)}>
                Editar
              </button>
              {/* Botão para excluir a tarefa */}
              <button className="btn btn-danger btn-sm" onClick={() => excluirTarefa(tarefa.id)}>
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Modal de Edição */}
      {tarefaEditando && (
        <div className="modal" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Tarefa</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Fechar" onClick={fecharModalEditar}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {/* Campo de entrada para a nova descrição da tarefa */}
                <input
                  type="text"
                  className="form-control mb-2"
                  value={novaDescricao}
                  onChange={e => setNovaDescricao(e.target.value)}
                />
                {/* Seleção para escolher o status da tarefa (concluída ou não concluída) */}
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={statusConcluida}
                  onChange={e => setStatusConcluida(e.target.value)}
                >
                  <option value="0">Não Concluída</option>
                  <option value="1">Concluída</option>
                </select>
              </div>
              <div className="modal-footer">
                {/* Botão para fechar o modal */}
                <button type="button" className="btn btn-secondary" onClick={fecharModalEditar}>
                  Fechar
                </button>
                {/* Botão para salvar as alterações */}
                <button type="button" className="btn btn-primary" onClick={salvarEdicao}>
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Fim do Modal de Edição */}
    </div>
  );
}

export default App;
