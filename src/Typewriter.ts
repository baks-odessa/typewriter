interface Params {
  loop: boolean;
  typingSpeed: number;
  deletingSpeed: number;
}

type QueueItem = () => Promise<void>;
type Cb = (resolve: () => void, reject: () => void) => void;

export default class Typewriter {
  #element: HTMLElement;
  #loop: boolean;
  #typingSpeed: number;
  #deletingSpeed: number;
  #queue: QueueItem[] = [];

  constructor(
    container: HTMLElement,
    {
      loop = false, typingSpeed = 50, deletingSpeed = 50
    }: Params
  ) {
    this.#element = document.createElement('div');
    container.append(this.#element);
    this.#loop = loop;
    this.#typingSpeed = typingSpeed;
    this.#deletingSpeed = deletingSpeed;
  }

  typeString(str: string): Typewriter {
    const cb: Cb = (resolve => {
      let i = 0;
      const strLength = str.length;

      const interval = setInterval(() => {
        this.#element.append(str[i]);
        i++;

        if (i >= strLength) {
          clearInterval(interval);
          resolve();
        }
      }, this.#typingSpeed)
    });

    this.#addToQueue(cb);

    return this;
  }

  pauseFor(duration: number): Typewriter {
    const cb: Cb = (resolve => {
      setTimeout(resolve, duration);
    });

    this.#addToQueue(cb);

    return this;
  }

  deleteChars(delay: number): Typewriter {
    const cb: Cb = (resolve => {
      let i = 0;
      const interval = setInterval(() => {
        this.#element.innerText = this.#element.innerText.substring(
          0,
          this.#element.innerText.length - 1
        );
        i++;

        if (i >= delay) {
          clearInterval(interval);
          resolve();
        }
      }, this.#deletingSpeed)
    });

    this.#addToQueue(cb);

    return this;
  }

  deleteAll(delay: number): Typewriter {
    const cb: Cb = (resolve => {
      const interval = setInterval(() => {
        this.#element.innerText = this.#element.innerText.substring(
          0,
          this.#element.innerText.length - 1
        );

        if (this.#element.innerText.length === 0) {
          clearInterval(interval);
          resolve();
        }
      }, delay || this.#deletingSpeed)
    });

    this.#addToQueue(cb);

    return this;
  }

  async start(): Promise<Typewriter> {
    let cb = this.#queue.shift();

    while(cb) {
      await cb();
      if (this.#loop) {
        this.#queue.push(cb);
        cb = this.#queue.shift();
      }
    }

    return this;
  }

  #addToQueue(cb: Cb): void {
    this.#queue.push(() => new Promise(cb));
  }
}
