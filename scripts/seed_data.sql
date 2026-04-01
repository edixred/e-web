-- Sample data for LinguaRead
-- Run this after tables are created

-- Insert sample stories
INSERT INTO stories (title_en, title_es, content_en, content_es, level, category) VALUES
(
    'The Lost Key',
    'La Llave Perdida',
    'Maria found an old key in her grandmother''s attic. It was rusty and mysterious. She wondered what door it could open. Her grandmother smiled and said, "That key opens a box full of family memories." Maria carefully opened the box. Inside, she found old photographs, letters, and a beautiful necklace. She learned that family history is precious.',
    'María encontró una llave old en el desván de su abuela. Estaba oxidada y misteriosa. Se preguntaba qué puerta podría abrir. Su abuela sonrió y dijo: "Esa llave abre una caja llena de recuerdos familiares." María abrió la caja con cuidado. Dentro, encontró fotografías old, cartas y un collar hermoso. Aprendió que la historia familiar es preciosa.',
    'A1',
    'Adventure'
),
(
    'The Space Adventure',
    'La Aventura Espacial',
    'Tom was a young scientist who dreamed of traveling to Mars. He worked very hard every day to build a spaceship. Finally, the day came when his rocket was ready. He felt nervous but excited. As the rocket lifted off, Tom looked back at Earth and smiled. He was going to explore the red planet!',
    'Tom era un científico joven que soñaba con viajar a Marte. Trabajaba muy duro todos los días para construir una nave espacial. Finalmente, llegó el día cuando su cohete estuvo listo. Se sentía nervioso pero emocionado. Mientras el cohete despegaba, Tom miró hacia atrás a la Tierra y sonrió. ¡Iba a explorar el planeta rojo!',
    'A2',
    'Science Fiction'
),
(
    'The Mystery of the Old House',
    'El Misterio de la Casa Vieja',
    'Everyone in the town was afraid of the old house on the hill. No one had entered it for fifty years. One stormy night, a brave journalist named Sarah decided to investigate. She found mysterious letters hidden in the walls. The letters revealed a family secret that had been buried for generations. Sometimes, the truth is more surprising than fiction.',
    'Todos en el pueblo le tenían miedo a la casa vieja en la colina. Nadie había entrado en ella durante cincuenta años. Una noche tormentosa, una valiente periodista llamada Sarah decidió investigar. Encontró cartas misteriosas ocultas en las paredes. Las cartas revelaron un secreto familiar que había estado enterrado durante generaciones. A veces, la verdad es más sorprendente que la ficción.',
    'B1',
    'Mystery'
),
(
    'Love in the City',
    'Amor en la Ciudad',
    'Emma worked in a busy coffee shop in New York City. Every morning, a handsome architect came in for his coffee. They started talking about books and architecture. Over time, they realized they were falling in love. The city was noisy, but their love story was quiet and beautiful. Sometimes, the best relationships start with a simple cup of coffee.',
    'Emma trabajaba en una cafetería concurrida en la ciudad de Nueva York. Todas las mañanas, un apuesto arquitecto entraba por su café. Empezaron a hablar sobre libros y arquitectura. Con el tiempo, se dieron cuenta de que se estaban enamorando. La ciudad era ruidosa, pero su historia de amor era tranquila y hermosa. A veces, las mejores relaciones comienzan con una simple taza de café.',
    'B2',
    'Romance'
),
(
    'The Future of Humanity',
    'El Futuro de la Humanidad',
    'In the year 2150, humanity had colonized several planets. Dr. Martinez was leading a groundbreaking project to communicate with alien civilizations. Her team had developed a universal translator that could decode any language. When the first message arrived from a distant galaxy, Dr. Martinez realized that everything humanity believed about the universe was about to change. The discovery would reshape our understanding of existence itself.',
    'En el año 2150, la humanidad había colonizado varios planetas. La Dra. Martinez lideraba un proyecto innovador para comunicarse con civilizaciones alienígenas. Su equipo había desarrollado un traductor universal que podía decodificar cualquier idioma. Cuando llegó el primer mensaje de una galaxia distante, la Dra. Martinez se dio cuenta de que todo lo que la humanidad creía sobre el universo estaba a punto de cambiar. El descubrimiento reformularía nuestra comprensión de la existencia misma.',
    'C1',
    'Science Fiction'
);
