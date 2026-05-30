from flask import Blueprint, request, jsonify, current_app
from utils.auth import token_required
from werkzeug.utils import secure_filename
import os
import uuid
from models import db, SessionMaterial, User
from datetime import datetime

material_routes = Blueprint('materials', __name__, url_prefix='/api/materials')

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@material_routes.route('', methods=['GET'])
@token_required
def get_materials():
    """Get materials for the current user, optionally filtered by subject and search query"""
    current_user_id = request.current_user_id
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    subject = request.args.get('subject_focus')
    search_query = request.args.get('search', '').lower()
    
    query = SessionMaterial.query.filter_by(user_id=user.id)
    
    if subject:
        query = query.filter_by(subject_focus=subject)
        
    if search_query:
        query = query.filter(SessionMaterial.title.ilike(f'%{search_query}%'))
        
    materials = query.order_by(SessionMaterial.created_at.desc()).all()
    
    return jsonify({
        'materials': [m.to_dict() for m in materials]
    }), 200

@material_routes.route('', methods=['POST'])
@token_required
def add_material():
    """Add a new material (file, image, or link)"""
    current_user_id = request.current_user_id
    
    title = request.form.get('title')
    material_type = request.form.get('material_type') # 'document', 'image', 'link'
    subject_focus = request.form.get('subject_focus')
    
    if not title or not material_type:
        return jsonify({'error': 'Title and material_type are required'}), 400
        
    new_material = SessionMaterial(
        user_id=current_user_id,
        title=title,
        material_type=material_type,
        subject_focus=subject_focus
    )
    
    if material_type in ['document', 'image']:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in request'}), 400
            
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        if file and allowed_file(file.filename):
            # Generate a secure, unique filename
            original_ext = file.filename.rsplit('.', 1)[1].lower()
            unique_filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
            
            upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
            if not os.path.exists(upload_folder):
                os.makedirs(upload_folder, exist_ok=True)
                
            file_path = os.path.join(upload_folder, unique_filename)
            file.save(file_path)
            
            new_material.file_path = unique_filename
        else:
            return jsonify({'error': 'File type not allowed'}), 400
            
    elif material_type == 'link':
        url = request.form.get('url')
        if not url:
            return jsonify({'error': 'URL is required for links'}), 400
        new_material.url = url
    else:
        return jsonify({'error': 'Invalid material_type'}), 400
        
    try:
        db.session.add(new_material)
        db.session.commit()
        return jsonify({'message': 'Material added successfully', 'material': new_material.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Error adding material: {e}')
        return jsonify({'error': 'Internal server error'}), 500

@material_routes.route('/<int:material_id>', methods=['DELETE'])
@token_required
def delete_material(material_id):
    """Delete a material"""
    current_user_id = request.current_user_id
    
    material = SessionMaterial.query.filter_by(id=material_id, user_id=current_user_id).first()
    
    if not material:
        return jsonify({'error': 'Material not found'}), 404
        
    try:
        # Delete the file if it exists
        if material.file_path:
            upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
            full_path = os.path.join(upload_folder, material.file_path)
            if os.path.exists(full_path):
                os.remove(full_path)
                
        db.session.delete(material)
        db.session.commit()
        return jsonify({'message': 'Material deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Error deleting material: {e}')
        return jsonify({'error': 'Internal server error'}), 500

import requests

@material_routes.route('/search_web', methods=['GET'])
@token_required
def search_web_results():
    """Retrieve search results from Wikipedia API (Zero-dependency & no API keys)"""
    query = request.args.get('search', '')
    if not query:
        return jsonify({'results': []}), 200
        
    try:
        import urllib.parse
        encoded_query = urllib.parse.quote(query)
        url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={encoded_query}&utf8=&format=json&srlimit=5"
        response = requests.get(url)
        data = response.json()
        
        results = []
        if 'query' in data and 'search' in data['query']:
            import re
            for item in data['query']['search']:
                # Clean up the HTML span tags that Wikipedia injects around matched text in snippets
                snippet = re.sub(r'<[^>]+>', '', item.get('snippet', ''))
                
                # Build canonical wikipedia link
                title_url = urllib.parse.quote(item.get('title', '').replace(' ', '_'))
                
                results.append({
                    'title': item.get('title') + ' (Wikipedia)',
                    'link': f"https://en.wikipedia.org/wiki/{title_url}",
                    'snippet': snippet + '...'
                })
                
        return jsonify({'results': results}), 200
    except Exception as e:
        current_app.logger.error(f'Error performing wikipedia search: {e}')
        return jsonify({'error': 'Internal server error during knowledge search'}), 500

