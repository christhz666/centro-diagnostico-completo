from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import psycopg2
import os
import json

bp = Blueprint('resultados', __name__)

def get_db_connection():
    return psycopg2.connect(os.getenv('DATABASE_URL'))

@bp.route('/', methods=['GET'])
@jwt_required()
def listar_resultados():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT id, tipo_archivo, nombre_archivo, fecha_importacion, estado_validacion
            FROM resultados
            ORDER BY fecha_importacion DESC
            LIMIT 50
        """)
        
        resultados = []
        for row in cur.fetchall():
            resultados.append({
                'id': row[0],
                'tipo_archivo': row[1] or 'pdf',
                'nombre_archivo': row[2] or 'Sin nombre',
                'fecha': row[3].isoformat() if row[3] else None,
                'estado_validacion': row[4] or 'pendiente'
            })
        
        cur.close()
        conn.close()
        return jsonify({'resultados': resultados}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e), 'resultados': []}), 500

@bp.route('/<int:resultado_id>', methods=['GET'])
@jwt_required()
def ver_resultado(resultado_id):
    """Ver detalle con TODOS los datos incluyendo valores JSONB"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                r.id,
                r.tipo_archivo,
                r.nombre_archivo,
                r.fecha_importacion,
                r.estado_validacion,
                r.datos_dicom,
                r.interpretacion,
                r.valores_referencia
            FROM resultados r
            WHERE r.id = %s
        """, (resultado_id,))
        
        row = cur.fetchone()
        if not row:
            return jsonify({'error': 'No encontrado'}), 404
        
        # Parsear datos_dicom (que es JSONB)
        datos = None
        if row[5]:  # datos_dicom
            if isinstance(row[5], str):
                try:
                    datos = json.loads(row[5])
                except:
                    datos = row[5]
            else:
                # Ya es un dict (psycopg2 parsea JSONB automáticamente)
                datos = row[5]
        
        resultado = {
            'id': row[0],
            'tipo_archivo': row[1],
            'nombre_archivo': row[2],
            'fecha': row[3].isoformat() if row[3] else None,
            'estado_validacion': row[4],
            'datos': datos,  # ESTE ES EL CAMPO IMPORTANTE
            'interpretacion': row[6],
            'valores_referencia': row[7]
        }
        
        cur.close()
        conn.close()
        
        print(f"? Resultado {resultado_id}: {json.dumps(resultado, indent=2)}")
        return jsonify(resultado), 200
        
    except Exception as e:
        print(f"? Error en ver_resultado: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
