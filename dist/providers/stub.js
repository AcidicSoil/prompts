export class StubProvider {
    name = 'stub';
    async ping() { return true; }
    async generate(prompt) {
        return `STUB: ${prompt.slice(0, 32)}`;
    }
}
