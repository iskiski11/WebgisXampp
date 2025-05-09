// Inisialisasi peta
const map = L.map('map').setView([-6.903, 107.6510], 13);

// Basemap OpenStreetMap
const basemapOSM = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Basemap tambahan
const osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team'
});

const baseMapGoogle = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    attribution: 'Map by <a href="https://maps.google.com/">Google</a>',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

// Kontrol tambahan
map.addControl(new L.Control.Fullscreen());

map.addControl(
    L.control.locate({
        locateOptions: { enableHighAccuracy: true }
    })
);

// Lokasi awal untuk tombol home
const home = {
    lat: -6.903,
    lng: 107.6510,
    zoom: 13
};

// Tombol kembali ke home
L.easyButton('<i class="fas fa-home"></i>', function (btn, map) {
    map.setView([home.lat, home.lng], home.zoom);
}, 'Kembali ke Home').addTo(map);

// Simbologi titik
const symbologyPoint = {
    radius: 5,
    fillColor: "#9dfc03",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

// Layer Kelurahan
const adminKelurahanAR = new L.LayerGroup();
$.getJSON("./assets/data-spasial/admin_kelurahan_ln.geojson", function (data) {
    L.geoJSON(data, {
        style: {
            color: "black",
            weight: 2,
            opacity: 1,
            dashArray: '3,3,20,3,20,3,20,3,20,3,20',
            lineJoin: 'round'
        }
    }).addTo(adminKelurahanAR);
});
adminKelurahanAR.addTo(map);

// Layer Jembatan
const jembatanPT = new L.LayerGroup();
$.getJSON("./assets/data-spasial/jembatan_pt.geojson", function (data) {
    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, symbologyPoint);
        }
    }).addTo(jembatanPT);
});
jembatanPT.addTo(map);

// Layer Landcover
const landcover = new L.LayerGroup();
$.getJSON("./assets/data-spasial/landcover_ar.geojson", function (data) {
    L.geoJson(data, {
        style: function (feature) {
            const remark = feature.properties.REMARK;
            const styles = {
                'Danau/Situ': { fillColor: "#97DBF2", color: "#4065EB" },
                'Empang': { fillColor: "#97DBF2", color: "#4065EB" },
                'Sungai': { fillColor: "#97DBF2", color: "#4065EB" },
                'Hutan Rimba': { fillColor: "#38A800", color: "#38A800" },
                'Perkebunan/Kebun': { fillColor: "#E9FFBE", color: "#E9FFBE" },
                'Permukiman dan Tempat Kegiatan': { fillColor: "#FFBEBE", color: "#FB0101", weight: 0.5 },
                'Sawah': { fillColor: "#01FBBB", color: "#4065EB", weight: 0.5 },
                'Semak Belukar': { fillColor: "#FDFDFD", color: "#00A52F", weight: 0.5 },
                'Tanah Kosong/Gundul': { fillColor: "#FDFDFD", color: "#000000", weight: 0.5 },
                'Tegalan/Ladang': { fillColor: "#EDFF85", color: "#EDFF85" },
                'Vegetasi Non Budidaya Lainnya': { fillColor: "#000000", color: "#000000", weight: 0.5 }
            };

            const baseStyle = {
                fillOpacity: 0.8,
                weight: styles[remark]?.weight || 0.5,
                color: styles[remark]?.color || "#666666",
                fillColor: styles[remark]?.fillColor || "#CCCCCC"
            };

            return baseStyle;
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup('<b>Tutup Lahan: </b>' + feature.properties.REMARK);
        }
    }).addTo(landcover);
});
landcover.addTo(map);
const baseMaps = {
"Openstreetmap" : basemapOSM,
"OSM HOT" : osmHOT,
"Google" : baseMapGoogle
};
const overlayMaps = {
"Jembatan" : jembatanPT,
"Batas Administrasi" : adminKelurahanAR,
"Tutupan Lahan": landcover
};
L.control.layers(baseMaps,overlayMaps).addTo(map);

let legend = L.control({ position: "topright" });

legend.onAdd = function () {
    let div = L.DomUtil.create("div", "legend");

    div.innerHTML = `
        <p style="font-size: 18px; font-weight: bold; margin-bottom: 5px; margin-top: 10px;">
            Legenda
        </p>

        <p style="font-size: 12px; font-weight: bold; margin-bottom: 5px; margin-top: 10px;">
            Infrastruktur
        </p>
        <div>
            <svg style="display: block; margin: auto; text-align: center; stroke-width: 1; stroke: rgb(0,0,0);">
                <circle cx="15" cy="8" r="5" fill="#9dfc03" />
            </svg>
        </div>
        Jembatan<br>

        <p style="font-size: 12px; font-weight: bold; margin-bottom: 5px; margin-top: 10px;">
            Batas Administrasi
        </p>
        <div>
            <svg>
                <line x1="0" y1="11" x2="23" y2="11" 
                      style="stroke-width: 2; stroke: rgb(0,0,0); stroke-dasharray: 10 1 1 1 1 1 1 1 1 1;" />
            </svg>
        </div>
        Batas Desa/Kelurahan<br>

        <p style="font-size: 12px; font-weight: bold; margin-bottom: 5px; margin-top: 10px;">
            Tutupan Lahan
        </p>
        <div style="background-color: #97DBF2; width: 20px; height: 10px;"></div> Danau/Situ<br>
        <div style="background-color: #97DBF2; width: 20px; height: 10px;"></div> Empang<br>
        <div style="background-color: #38A800; width: 20px; height: 10px;"></div> Hutan Rimba<br>
        <div style="background-color: #E9FFBE; width: 20px; height: 10px;"></div> Perkebunan/Kebun<br>
        <div style="background-color: #FFBEBE; width: 20px; height: 10px;"></div> Permukiman dan Tempat Kegiatan<br>
        <div style="background-color: #01FBBB; width: 20px; height: 10px;"></div> Sawah<br>
        <div style="background-color: #FDFDFD; width: 20px; height: 10px;"></div> Semak Belukar<br>
        <div style="background-color: #97DBF2; width: 20px; height: 10px;"></div> Sungai<br>
        <div style="background-color: #FDFDFD; width: 20px; height: 10px;"></div> Tanah Kosong/Gundul<br>
        <div style="background-color: #EDFF85; width: 20px; height: 10px;"></div> Tegalan/Ladang<br>
        <div style="background-color: #000000; width: 20px; height: 10px;"></div> Vegetasi Non Budidaya Lainnya<br>
    `;

    return div;
};

legend.addTo(map);