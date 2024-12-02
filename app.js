$(document).ready(function() {
    const db = firebase.firestore();
    const storage = firebase.storage();

    // Carregar itens do Firestore
    db.collection("items").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            $("#content").append(`
                <div class="card">
                    <img src="${data.imageUrl}" class="card-img-top" alt="${data.name}">
                    <div class="card-body">
                        <h5 class="card-title">${data.name}</h5>
                        <p class="card-text">${data.description}</p>
                        <p class="card-text">Categoria: ${data.category}</p>
                        <p class="card-text">Tipo: ${data.type}</p>
                        <p class="card-text">Classificação: ${data.rating}</p>
                        <p class="card-text">Ano de Lançamento: ${data.year}</p>
                        <video controls class="w-100">
                            <source src="${data.videoUrl}" type="video/mp4">
                            Seu navegador não suporta o elemento de vídeo.
                        </video>
                    </div>
                </div>
            `);
        });
    }).catch((error) => {
        console.error("Erro ao carregar itens do Firestore: ", error);
    });

    // Adicionar novo item ao Firestore
    $("#itemForm").submit(function(event) {
        event.preventDefault();

        const itemName = $("#itemName").val();
        const itemDescription = $("#itemDescription").val();
        const itemCategory = $("#itemCategory").val();
        const itemType = $("#itemType").val();
        const itemRating = $("#itemRating").val();
        const itemYear = $("#itemYear").val();
        const itemImage = $("#itemImage")[0].files[0];
        const itemVideo = $("#itemVideo")[0].files[0];

        // Verificar se os arquivos foram selecionados
        if (!itemImage || !itemVideo) {
            console.error("Imagem e vídeo são obrigatórios.");
            return;
        }

        const uploadImageTask = storage.ref(`images/${itemImage.name}`).put(itemImage);
        const uploadVideoTask = storage.ref(`videos/${itemVideo.name}`).put(itemVideo);

        uploadImageTask.on("state_changed", 
            () => {}, 
            (error) => console.error("Erro ao fazer upload da imagem: ", error), 
            () => {
                uploadImageTask.snapshot.ref.getDownloadURL().then((imageUrl) => {
                    uploadVideoTask.on("state_changed",
                        () => {}, 
                        (error) => console.error("Erro ao fazer upload do vídeo: ", error), 
                        () => {
                            uploadVideoTask.snapshot.ref.getDownloadURL().then((videoUrl) => {
                                db.collection("items").add({
                                    name: itemName,
                                    description: itemDescription,
                                    category: itemCategory,
                                    type: itemType,
                                    rating: itemRating,
                                    year: itemYear,
                                    imageUrl: imageUrl,
                                    videoUrl: videoUrl
                                }).then(() => {
                                    $("#content").append(`
                                        <div class="card">
                                            <img src="${imageUrl}" class="card-img-top" alt="${itemName}">
                                            <div class="card-body">
                                                <h5 class="card-title">${itemName}</h5>
                                                <p class="card-text">${itemDescription}</p>
                                                <p class="card-text">Categoria: ${itemCategory}</p>
                                                <p class="card-text">Tipo: ${itemType}</p>
                                                <p class="card-text">Classificação: ${itemRating}</p>
                                                <p class="card-text">Ano de Lançamento: ${itemYear}</p>
                                                <video controls class="w-100">
                                                    <source src="${videoUrl}" type="video/mp4">
                                                    Seu navegador não suporta o elemento de vídeo.
                                                </video>
                                            </div>
                                        </div>
                                    `);
                                    $("#itemForm")[0].reset();
                                }).catch((error) => {
                                    console.error("Erro ao adicionar documento: ", error);
                                });
                            }).catch((error) => {
                                console.error("Erro ao obter URL do vídeo: ", error);
                            });
                        }
                    );
                }).catch((error) => {
                    console.error("Erro ao obter URL da imagem: ", error);
                });
            }
        );
    });
});
