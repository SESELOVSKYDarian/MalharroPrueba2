// Función reutilizable para guardar texto editado en cualquier tipo de objeto (texto, acordeón, etc.)
export const handleSave = async ({ objetoAEditar, idObjeto, nuevoContenido, jwt, campoAModificar }) => {
    try {
        const putRes = await fetch(`/api/${objetoAEditar}/${idObjeto}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({
                [campoAModificar]: nuevoContenido,
            }),
        });

        const updated = await putRes.json();

        if (!putRes.ok) {
            throw new Error(updated.message || 'Error al guardar');
        }

        return updated.item?.[campoAModificar];
    } catch (err) {
        console.error(err);
        throw err; // Permite que el componente que llama maneje el error
    }
};
