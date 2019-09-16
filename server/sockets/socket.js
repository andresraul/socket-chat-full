const { io } = require('../server');
const { Usuario } = require('../classes/usuarios');
const { crearMensaje } = require('../utilidades/utilidades');

const usuario = new Usuario();


io.on('connection', (client) => {

    client.on('entrarChat', (data, callback) => {
        if (!data.nombre || !data.sala) {
            return callback({
                err: true,
                message: 'El nombre/sala es necesario'
            });
        }

        client.join(data.sala);

        usuario.agregarPersona(client.id, data.nombre, data.sala);

        client.broadcast.to(data.sala).emit('listaPersonas', usuario.getPersonasPorSala(data.sala));

        callback(usuario.getPersonasPorSala(data.sala));

    });


    client.on('crearMensaje', (data) => {

        let persona = usuario.getPersona(client.id);

        let mensaje = crearMensaje(persona.nombre, data.mensaje);

        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);

    });



    client.on('disconnect', () => {
        let personaBorrada = usuario.borrarPersona(client.id);

        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${personaBorrada.nombre} salió`));
        client.broadcast.to(personaBorrada.sala).emit('listaPersonas', usuario.getPersonasPorSala(personaBorrada.sala));

    });

    client.on('mensajePrivado', (data) => {
        let persona = usuario.getPersona(client.id);

        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona, data.mensaje));
    });



});