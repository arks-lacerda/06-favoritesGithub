import { GithubUser } from './GithubUser.js';

//classe que vai conter a lógica dos dados
// class that will contain the logic of the data

// como os dados serão estruturados
//how the data will be structured
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();

    // GithubUser.search('arks-lacerda').then(user => console.log(user))
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || [];
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries));
  }

  async add(username) {
    try {
      const userExists = this.entries.find((entry) => entry.login === username);
      console.log(userExists);
      if (userExists) {
        throw new Error('Usuário já adicionado!');
      }

      const user = await GithubUser.search(username);
      if (user.login === undefined) {
        throw new Error('Usuário não encontrado!');
      }

      this.entries = [user, ...this.entries];
      this.update();
      this.save();
    } catch (error) {
      alert(error.message);
    }
  }

  delete(user) {
    // Higher-order functions (map, filter, find, reduce)
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    );
    this.entries = filteredEntries;
    this.update();
    this.save();
  }
}

//classe que vai criar a visualização e eventos do HTML
//class that will create the visualization and events of the HTML
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.tbody = this.root.querySelector('table tbody');

    this.update();
    this.onadd();
  }

  onadd() {
    const addButton = this.root.querySelector('.search button');
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input');

      this.add(value);
    };
  }

  update() {
    this.removeAllTr();

    this.entries.forEach((user) => {
      const row = this.createRow();

      row.querySelector(
        '.user img'
      ).src = `https://github.com/${user.login}.png`;
      row.querySelector('.user img').alt = `Image by ${user.name}`;
      row.querySelector('.user a').href = `https://github.com/${user.login}`;
      row.querySelector('.user p').textContent = user.name;
      row.querySelector('.user span').textContent = user.login;
      row.querySelector('.repositories').textContent = user.public_repos;
      row.querySelector('.followers').textContent = user.followers;
      row.querySelector('.remove').onclick = () => {
        const isOK = confirm('Tem certeza que deseja remover esse usuário?');
        if (isOK) {
          this.delete(user);
        }
      };

      this.tbody.append(row);
    });
  }

  createRow() {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="user">
        <img
          src="https://github.com/arks-lacerda.png"
          alt="Image by Arthur Lacerda"
        />
        <a href="https://github.com/arks-lacerda" target="_blank">
          <p>Arthur Lacerda</p>
          <span>arks-lacerda</span>
        </a>
      </td>
      <td class="repositories">76</td>
      <td class="followers">9876</td>
      <td>
        <button class="remove">&times;</button>
      </td>
    `;
    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach((tr) => {
      tr.remove();
    });
  }
}
