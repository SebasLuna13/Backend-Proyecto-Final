const express = require("express")
const yup = require("yup")

const connection = require("./db") // importar la conexión a la base de datos

const router = express.Router()

// Validación de los datos del producto
const schema = yup.object().shape({
  name: yup.string().required("El nombre es obligatorio"),
  price: yup.number().required("El precio es obligatorio"),
  imagen: yup.string().url("Debe ser un URL válido").required("La imagen es obligatoria"),
  description: yup.string().required("La descripción es obligatoria"),
});

// Obtener todos los productos
router.get("/productos", function (request, response) {
  connection.query("SELECT * FROM producto ORDER BY id DESC", 
    function (error, result) {
      if (error) {
        console.log("Error al obtener productos", error)
      } else {
        response.json(result)
      }
  });
});

// Crear un nuevo producto
router.post("/producto", async function (request, response) {

  const data = request.body;

  try {
    const result = await schema.validate(data)
    console.log(result)

    const query = "INSERT INTO producto (name, price, imagen, description) VALUES (?, ?, ?, ?)";

    connection.execute(query, Object.values(data), function (error, result) {
      if (error) {
        response.status(400).json({
          message: "Error al guardar el Producto",
          error: error,
        })
      } else {
        response.json({
          message: "Producto guardado correctamente",
          data: result,
        })
      }
    })
  } catch (error) {
    response.status(400).json({
      message: error.message,
    })
  }
})

router.get("/producto/:id", function (request, response) {
  const { id } = request.params

  const query = "SELECT * FROM producto WHERE id =?"

  connection.query(query, [id], function (error, result) {
    if (error) {
      response.status(404).json({
        message: "Producto no encontrado",
        error: error,
      })
    } else {
      if (result.length > 0) {
        response.json(result[0])
      } else {
        response.status(404).json({
          message: "Producto no encontrado",
        })
      }
    }
  })
})

router.put("/producto/:id",async function (request, response){
  const data = request.body
  const { id } = request.params

  try {
    await schema.validate(data)
    const query = "UPDATE producto SET name =?, price =?, imagen =?, description =? WHERE id =?"

    connection.execute(query, Object.values(data).concat(id), function(error, result){
      if(error){
        response.status(400).json({
          message: "Error al actualizar el producto",
          error: error
        })
      } else {
        response.json({
          message: "Producto Actualizado",
          data: result
        })
      }
    })
  } catch (error) {
    response.status(400).json({
      message: error.message,
    })
  }
})

router.delete("/producto/:id", function(request, response){
  const { id } = request.params

  const query = "DELETE FROM producto WHERE id =?"

  connection.execute(query, [id], function(error, result){
    if(error){
      response.status(404).json({
        message: "Error al eliminar el Producto",
        error: error
      })
    } else {
      response.json({
        message: "Producto Eliminado",
        data: result
      })
    }
  })
})

module.exports = router
