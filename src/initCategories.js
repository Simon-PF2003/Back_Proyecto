const Category = require('./models/category');

// "Perifericos"
const createPerifericosCategory = async () => {
  try {
    const existing = await Category.findOne({ type: 'Perifericos' });
    if (!existing) {
      const cat = new Category({ type: 'Perifericos' });
      await cat.save();
      console.log('Categoría "Perifericos" creada exitosamente.');
    } else {
      console.log('La categoría "Perifericos" ya existe.');
    }
  } catch (error) {
    console.error('Error al crear la categoría "Perifericos":', error);
  }
};

// "Componentes"
const createComponentesCategory = async () => {
  try {
    const existing = await Category.findOne({ type: 'Componentes' });
    if (!existing) {
      const cat = new Category({ type: 'Componentes' });
      await cat.save();
      console.log('Categoría "Componentes" creada exitosamente.');
    } else {
      console.log('La categoría "Componentes" ya existe.');
    }
  } catch (error) {
    console.error('Error al crear la categoría "Componentes":', error);
  }
};

// "Impresoras"
const createImpresorasCategory = async () => {
  try {
    const existing = await Category.findOne({ type: 'Impresoras' });
    if (!existing) {
      const cat = new Category({ type: 'Impresoras' });
      await cat.save();
      console.log('Categoría "Impresoras" creada exitosamente.');
    } else {
      console.log('La categoría "Impresoras" ya existe.');
    }
  } catch (error) {
    console.error('Error al crear la categoría "Impresoras":', error);
  }
};

createPerifericosCategory();
createComponentesCategory();
createImpresorasCategory();
