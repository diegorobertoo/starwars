function randomInt(max) {
    return Math.round(Math.random() * max);
}

function element(TagName, className = '', innerHTML = '') {
    const element = document.createElement(TagName);
    element.className = className;
    element.innerHTML = innerHTML;
    return element;
}

class LockScreen {
    #element;
    constructor(game, msg, keyCode, fn) {
        this.#element = element('div', 'page-wrapper');
        this.#element.appendChild(element('h4', '', 'Stars Wars'));
        this.#element.appendChild(element('span', '', msg));
        game.appendChild(this.#element);
        this.controllers(keyCode, fn);
    }
    controllers(keyCode, fn) {
        window.onkeyup = (event) => {
            if (keyCode === event.keyCode) {
                this.#element.remove();
                fn();
            }
        }
    }
    
}

// SELEÇÃO DAS NAVES
class SelectSpaceShip {
    #element;
    constructor (game, spaceships, fn) {
        this.#element = element('div','select-spaceship');
        this.#element.appendChild(element('span', '', 'Selecione sua nave para a batalha'));
        game.appendChild(this.#element);
        this.#element.appendChild(this.#createSpaceships(spaceships, fn));
    }

    #createSpaceships(spaceships, fn) {
        const container = element('div', 'spaceships');
        spaceships.forEach(item => {
            const a = element('a');
            a.href = '#';
            const div = Spaceship.createSpaceship(item.type);
            a.appendChild(div);
            container.appendChild(a);
            a.onclick = () => {
                fn(item);
                this.#element.remove();
            }
        });
        return container;
    }
}

// SCORE (PONTUAÇÃO) DO JOGO
class Score {
    #element;
    #points;

    constructor(game) {
        const div = element('div', 'score', 'Pontuação<br>');
        this.#element = element('span', '', 0);
        div.appendChild(this.#element);
        game.appendChild(div);
        this.#points = 0;
    }
    addPoint() {
        this.#points++;
        this.#element.innerHTML = this.#points;
    }
}

// OBJETO VOADOR NÃO IDENTIFICADO (OVNI)
class UFO {
    #game;
    #element;
    #top;
    constructor(game, element, top = true) {
        this.#game = game;
        this.#element = element;
        this.#game.appendChild(this.#element);
        this.#top = top;
    }

    get x() {return this.#element.getBoundingClientRect().left;}
    get y() {return this.#element.getBoundingClientRect().top;}
    get width() {return this.#element.getBoundingClientRect().width;}
    get height() {return this.#element.getBoundingClientRect().height;}
    get maxWidth() {return this.#game.clientWidth;}
    get maxHeight() {return this.#game.clientHeight;}
    set x(x) {this.#element.style.left= `${x}px`;}
    set y(y) {this.#element.style.top= `${y}px`;}

    checkArea() {
        if(this.y + this.height < 0 || this.y > this.maxHeight) {
            return false;
        }
        return true;
    }

    animation(mov) {
        this.y += (this.#top) ? -mov : mov;
        if (!this.checkArea()) {
            this.remove();
            return false;
        }
        return true;
    }

    remove() {
        this.#element.remove();
    }
}

// ESPAÇONAVE REBELDE
class Spaceship extends UFO {
    #guns;
    #gun_use;
    #type;
    #img;
    constructor(game, model, type = 'imperial') {
        const top = type !== 'imperial';
        const element = Spaceship.createSpaceship(model.type);
        super(game, element, top);  //chama o constructor do elemento pai
        this.#img = element.querySelector('img');

        this.y = this.maxHeight - this.height - 30;
        this.x = (this.maxWidth - this.width) / 2;
        this.#guns = model.guns;
        this.#gun_use = -1;
        this.#type = type;
    };

    static createSpaceship(type) {
        const div = element('div', 'spaceship ' + type);
        const img = element('img');
        img.src = `images/${type}.png`;
        div.appendChild(img);
        return div;
    };

    fire(game) {
        this.#gun_use++;
        this.#gun_use = (this.#gun_use >= this.#guns.length)? 0 : this.#gun_use;
        const gun = this.#guns[this.#gun_use];
        const newx = this.x + gun.x;
        const newy = this.y + gun.y;
        return new Laser(game, this.#type, newx, newy);
    };

    remove() {
        this.#img.src = 'images/explosion.gif';
        setTimeout(() => {
            super.remove();
        }, 500);
    }
}

class Laser extends UFO {
    constructor (game, type, x, y) {
        const top = type !== 'imperial';
        // super(game, element('div', 'laser ' + type), top);
        super(game, element('div', 'laser ' + type), top);
        this.x = x;
        this.y = y;
    }

    animation(mov) {
        return super.animation(mov * 2.5);
    }
}

class RebeldsSpaceship extends Spaceship {
    #direction;
    constructor(game, model) {
        super(game, model, 'rebelds');
    }
    set direction(direction) {
        this.#direction = direction;
    }  
    animation(mov) {
        let newx = this.x + (mov * this.#direction);
        
        if (newx < 0) {
            newx = 0;
        } else if (newx > this.maxWidth - this.width) {
            newx = this.maxWidth - this.width;
        }
        
        this.x = newx;
    }
} 

class EnemySpaceship extends Spaceship {
    constructor(game, model) {
        super(game, model);
        this.raffle();
    }
    
    raffle() {
        this.x = randomInt(this.maxWidth - this.width);
        this.y = randomInt(-2000)-200;
    }

    checkArea() {
        if(this.y > this.maxHeight + 20) {
            this.raffle();
        }
        return true;
    }

    fire(game) {
        if (this.y > 0 && this.y < (this.maxHeight - this.height - 30)) {
            return super.fire(game);
        }
        return false;
    }
}

// CLASSE QUE GERENCIA O JOGO
class StarWars {
    #game;   // Tela do Jogo

    // REBELDS
    #rebelds_models = [   // Opções de Espaçonaves
        {   
            type: 'xw',
            guns: [
                {x:0, y:5},
                {x:48, y:5}
            ]  
        },

        {   
            type: 'mf',
            guns: [
                {x:18, y:-10},
                {x:28, y:-10}
            ]  
        } 
    ];

    #rebeld_spaceship;   // Espaçonave selecionada 
    #rebelds_lasers;   // Laser Rebelde


    // INIMIGOS (ENEMIES)
    #enemies_models = [   // Modelos de Espaçonaves Inimigas
        {   
            type: 'ief',
            guns: [ 
                {x:14, y:64},
                {x:34, y:64}
            ]  
        },

        {   
            type: 'tfa',
            guns: [
                {x:2, y:44},
                {x:46, y:44}
            ]  
        },

        {   
            type: 'di',
            guns: [
                {x:25, y:64}
            ]  
        } 
    ];

    #enemies_spaceships;   // Espaçonave Inimiga 
    #enemies_lasers;   // Laser Inimigo
    #enemies_max = 5;   // Número máximo de inimigos na tela
    #enemies_lasers_intensity = 5;   // Use um valor de 1 a 10
    #interval;   // Armazena o motor do jogo
    #mov = 5;   // Deslocamento padrão dos objetos do jogo
    #score;   // Placar do Jogo;

    constructor() {
        this.#game = document.querySelector('body');
        new LockScreen(this.#game, 'Aperte Enter', 13,
            ()=> new SelectSpaceShip(
                this.#game, 
                this.#rebelds_models, 
                (type) => this.createSpaceship(type)
            )
        );

        // this.#testeModel(this.#enemies_models[1]);   // Testar modelo de nave
    }

    createSpaceship(type) {
        this.#rebeld_spaceship = new RebeldsSpaceship(this.#game, type);
        this.#rebelds_lasers = [];
        this.#enemies_spaceships = [];
        this.#enemies_lasers = [];
        this.#score = new Score(this.#game);
        this.start();
    } 

    start() {
        this.#gameControlls();
        this.#interval = setInterval(() => {
            if(this.#enemies_max > this.#enemies_spaceships.length) {
                const nmodel = randomInt(this.#enemies_models.length - 1);
                const model = this.#enemies_models[nmodel];
                this.#enemies_spaceships.push(new EnemySpaceship(this.#game, model));
            }

            this.#animation();
            this.#checkCollision();
        }, 20);
    }

    pause() {
        clearInterval(this.#interval);
        new LockScreen(this.#game, 'Aperte pause para continuar...', 19, 
            () => {
                this.start();
            }
        );
    }

    #animation() {   // Animação do jogo
        this.#rebeld_spaceship.animation(this.#mov);
        this.#animation_lasers(this.#rebelds_lasers);
        
        this.#enemies_spaceships.forEach((enemy) => {
            enemy.animation(this.#mov);
        });

        const raffle = randomInt((20 - this.#enemies_lasers_intensity) * this.#enemies_spaceships.length);
        if (raffle < this.#enemies_spaceships.length) {
            const laser = this.#enemies_spaceships[raffle].fire(this.#game);

            if(laser) {
                this.#enemies_lasers.push(laser);
            }
        }
        this.#animation_lasers(this.#enemies_lasers)
    }

    #animation_lasers(lasers) {
        lasers.forEach((laser,index) => {
            if (!laser.animation(this.#mov)) {
                lasers.splice(index, 1);
            };
        });
    };

    #checkCollision() {   
        // Verifica se a nave principal colidiu com algum UFO
        let collision_index = this.#collisionList(this.#rebeld_spaceship, this.#enemies_spaceships);
        if (collision_index !== false) {
            this.#rebeld_spaceship.remove();
            this.#enemies_spaceships[collision_index].remove();
            this.#gameOver();
        }

        // Veririca se a nave principal colidiu com laser inimigo
        collision_index = this.#collisionList(this.#rebeld_spaceship, this.#enemies_lasers);
        if (collision_index !== false) {
            this.#rebeld_spaceship.remove();
            this.#enemies_lasers[collision_index].remove();
            this.#gameOver();
        }

        // Verifica se laser acertou nave inimiga
        this.#enemies_spaceships.forEach((ufo, index) => {
            collision_index = this.#collisionList(ufo, this.#rebelds_lasers);
            if (collision_index !== false) {
                ufo.remove();
                this.#enemies_spaceships.splice(index, 1); 
                this.#rebelds_lasers[collision_index].remove();
                this.#rebelds_lasers.splice(collision_index, 1);
                this.#score.addPoint();
            }
        });
    } 

    #collisionList (ufo, ufo_list) {
        for (let x = 0; x < ufo_list.length; x++) {
            if (this.#collision(ufo, ufo_list[x])) {
                return x;
            };
        }
        return false;
    }

    #collision (ufo1, ufo2) {
        const horizontal = ufo1.x + ufo1.width >= ufo2.x
                           && ufo1.x <= ufo2.x + ufo2.width;

        const vertical = ufo1.y <= ufo2.y + ufo2.height
                         && ufo1.y + ufo1.height >= ufo2.y;

        return horizontal && vertical;
    }
    
    #gameOver() {
        clearInterval(this.#interval);
        new LockScreen (this.#game, 'Fim de Jogo, aperte ENTER!', 13, ()=> location.reload());
    }

    #gameControlls() {
        window.onkeyup = (event) => {
            switch(event.keyCode) {
                case 32:
                    const laser = this.#rebeld_spaceship.fire(this.#game);
                    this.#rebelds_lasers.push(laser);
                    break;

                case 19:
                    this.pause();
                    break;

                case 37:
                case 39:
                    this.#rebeld_spaceship.direction = 0;
                    break;

                case 73:
                    console.log(this.#rebelds_lasers);
                    break;
               
                default:
                    console.log("Controle Inexistente: " + event.keyCode);
                    break;
            }
        }

        window.onkeydown = (event) => {
            switch (event.keyCode) {
                case 37:
                    this.#rebeld_spaceship.direction = -1;
                    break;

                case 39:
                    this.#rebeld_spaceship.direction = 1;
                    break;
            }
        }
    }

    #testeModel(model,type = 'imperial') {
        const spaceship = new Spaceship(this.#game, model, type);
        spaceship.x = 200;
        spaceship.y = 200;
        model.guns.forEach(() => {
            spaceship.fire(this.#game);
        })
    }
}

new StarWars;

